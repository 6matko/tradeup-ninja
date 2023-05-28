import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TradeupOutcome, WorkerResponse } from '../tradeup-search/tradeup.model';
import { SimulationSettings, SimulationSummary } from './tradeup-simulation.model';
import { TradeupSimulationService } from './tradeup-simulation.service';

@Component({
  selector: 'app-tradeup-simulation',
  templateUrl: './tradeup-simulation.component.html',
  styleUrls: ['./tradeup-simulation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupSimulationComponent implements OnInit, OnChanges {
  /**
   * Form group of simulation settings
   *
   * @type {FormGroup}
   * @memberof TradeupSimulationComponent
   */
  simulationForm: FormGroup;
  /**
   * Flag indicates if tradeup simulation is shown
   *
   * @type {boolean}
   * @memberof TradeupSimulationComponent
   */
  isShown: boolean;
  /**
   * Outcomes for simulation
   *
   * @type {TradeupOutcome[]}
   * @memberof TradeupSimulationComponent
   */
  @Input() outcomes: TradeupOutcome[];
  /**
   * Cost of tradeup. Needed to calculate profitability
   *
   * @type {number}
   * @memberof TradeupSimulationComponent
   */
  @Input() cost: number;
  /**
   * Is tradeup stattrak or not
   *
   * @type {boolean}
   * @memberof TradeupSimulationComponent
   */
  @Input() stattrak: boolean;
  /**
   * Flag indicates if simulation should be shown in full screen mode
   *
   * @type {boolean}
   * @memberof TradeupSimulationComponent
   */
  fullScreen: boolean;
  /**
   * List with simulated outcomes
   *
   * @type {TradeupOutcome[]}
   * @memberof TradeupSimulationComponent
   */
  simulatedOutcomes: TradeupOutcome[] = [];
  /**
   * Simulation summary. Calculated after simulation ended
   *
   * @type {SimulationSummary}
   * @memberof TradeupSimulationComponent
   */
  simulationSummary: SimulationSummary = new SimulationSummary();
  /**
   * Amount of tradeups to simulate
   *
   * @type {number}
   * @memberof TradeupSimulationComponent
   */
  simulationCount: number = 10;
  /**
   * Flag indicates if loading indicator is active (something is loadingg)
   *
   * @type {boolean}
   * @memberof TradeupSimulationComponent
   */
  isLoading: boolean;
  /**
   * Little hack that is used to fix initial "click outside component" logic
   *
   * @private
   * @type {boolean}
   * @memberof TradeupInputInfoComponent
   */
  private initial: boolean = true;
  /**
   * Worker instance
   *
   * @private
   * @type {Worker}
   * @memberof TradeupSimulationComponent
   */
  private worker: Worker;
  constructor(
    private tradeupSimulationService: TradeupSimulationService,
    private elementRef: ElementRef<any>,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.createForm();
  }

  ngOnInit() {
    // Adding timeout just to show transition.
    // We need to do it because this component gets show/hidden via ngIf
    // and that means that after component was created it doesn't have height
    // to display it and therefore we are creating this component with hidden menu (initially).
    // After some time we mark that menu is shown and transition can be performed
    setTimeout(() => {
      this.isShown = true;
      this.cdr.markForCheck();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there were changes then clearing simulation
    if (changes.outcomes) {
      this.clearSimulation();
    }
  }

  /**
   * Method starts simulation process
   *
   * @memberof TradeupSimulationComponent
   */
  simulate() {
    // If there is an active worker, stopping it
    if (this.worker) {
      this.stop();
    }

    // Initializing worker
    this.initWorker();

    // Claering simulation if there are any simulated outcomes.
    // We need to do it for case when user wants to re-run simulation
    if (this.simulatedOutcomes.length) {
      this.clearSimulation();
    }
    // Storing simulation count for quick access and further reusability
    this.simulationCount = this.simulationForm.get('simulationCount').value;

    // Creating simulation settings for worker
    const simulationSettings = new SimulationSettings();
    simulationSettings.cost = this.cost;
    simulationSettings.count = this.simulationCount;
    simulationSettings.outcomes = this.outcomes;
    simulationSettings.stattrak = this.stattrak;

    // Starting simulation
    this.worker.postMessage({ cmd: 'start', settings: simulationSettings });

    // Enabling loading indicator and telling that there are some changes that need re-render
    this.isLoading = true;
    this.cdr.markForCheck();
  }

  /**
   * Method toggles full screen mode
   *
   * @memberof TradeupSimulationComponent
   */
  toggleFullScreen() {
    this.fullScreen = !this.fullScreen;
  }

  /**
   * Method closes (dismisses) tradeup simulator menu
   *
   * @memberof TradeupSimulationComponent
   */
  closeSimulation() {
    // Marking that menu should not be shown anymore
    this.isShown = false;
    // Marking view for change detection check in order to display changes in view
    this.cdr.markForCheck();
    // And finally adding timeout only for case to show transition of menu closing
    // and afterwards we destroy component
    setTimeout(() => {
      this.tradeupSimulationService.closeSimulation();
    }, 300);
  }

  /**
   * Method handles clicks outside of this component to dismiss it
   *
   * @param {Event} event Click event
   * @memberof TradeupInputInfoComponent
   */
  @HostListener('document:click', ['$event'])
  clickHandler(event: Event) {
    // Checking if user has clicked on simulation button
    const clickedOnSimulateBtn = this.isClickedOnSimulateBtn(event.target as Element);
    // Handling click outside of component
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // If this is innitial "Click outside of component" then we set flag initial flag
      // to false because next click won't be initial. This is a hack to prevent immediate dismiss
      // because when this component is shown via button it triggers "click outside" and therefore
      // immediatly dismisses it.
      // NOTE: Doing additional check if user has clicked on "Open simulation" button that is outside of this component.
      // If user clicked on that button then we don't have to close this menu. Important notice: Initially
      // this logic is called and therefore we need to handle this case with "Open simulation" button when
      // its not initial click. Otherwise menu will immediately open/close
      if (this.initial || (!this.initial && clickedOnSimulateBtn)) {
        this.initial = false;
      } else {
        this.closeSimulation();
      }
    }
  }

  /**
   * Method checks if user has clicked on "Open simulation" button or not
   *
   * @private
   * @param {Element} target Event target
   * @returns {boolean} Returns `boolean` with `true` if user clicked on "Open simulation" button
   * @memberof TradeupSimulationComponent
   */
  private isClickedOnSimulateBtn(target: Element): boolean {
    // Defining ID of simulate button in case if it changes then we can easily change it only in one place.
    // We are checking if user clicked on simulate button by its ID
    const simulateBtnId = 'openSimulation';
    // Checking if user clicked on simulate button by button id. There is a case where user can click on
    // icon and therefore we need to check parent element as well
    return target.id === simulateBtnId || target.parentElement.id === simulateBtnId;
  }

  /**
   * Method clears simulation state
   *
   * @private
   * @memberof TradeupSimulationComponent
   */
  private clearSimulation() {
    // Clearing everything simulation related
    this.simulatedOutcomes.length = 0;
    this.simulationSummary = new SimulationSummary();
  }

  /**
   * Method creates form
   *
   * @private
   * @memberof TradeupSimulationComponent
   */
  private createForm() {
    this.simulationForm = this.formBuilder.group({
      selectedView: ['items'],
      simulationCount: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    });
  }

  /**
   * Method initializes web worker to start searching
   *
   * @private
   * @memberof TradeupSimulationComponent
   */
  private initWorker() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker = new Worker('./tradeup-simulation.worker', { type: 'module' });
      this.worker.onmessage = ({ data }) => {
        // Handling response
        this.handleWorkerResponse(data);
      };
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
      // Displaying error message.
      this.toastr.error('Can\'t search without Web Workers. Try using different browser or enable this feature',
        'Web workers not supported', { disableTimeOut: true });
    }
  }

  /**
   * Method handles worker response
   *
   * @private
   * @param {WorkerResponse<any>} workResponse Data from web worker
   * @memberof TradeupSimulationComponent
   */
  private handleWorkerResponse(workResponse: WorkerResponse<any>) {
    if (workResponse.data) {
      // Storing simulated outcomes
      this.simulatedOutcomes = workResponse.data.simulatedOutcomes;
      // Storing simulation summary
      this.simulationSummary = workResponse.data.simulationSummary;
    } else {
      this.simulatedOutcomes.length = 0;
    }

    // If worker has completed its work then we can stop it
    if (workResponse.completed) {
      // Disabling loading indicator when worker has completed
      this.isLoading = false;
      this.stop();
    }
    // Marking that there are some changes that have to be rendered on view
    this.cdr.markForCheck();
  }

  /**
   * Method stops search process (Terminates worker)
   *
   * @memberof TradeupSimulationComponent
   */
  private stop() {
    this.worker.terminate();
    // Disabling loading indicator
    this.isLoading = false;
  }

}
