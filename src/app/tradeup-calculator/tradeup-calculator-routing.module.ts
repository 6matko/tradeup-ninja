import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { TradeupCalculatorComponent } from './tradeup-calculator.component';

const routes: Routes = [
    // Module is lazy loaded, see app-routing.module.ts
    {
        path: '',
        component: TradeupCalculatorComponent,
        data: {
            title: extract('Trade up calculator')
        },
        // resolve: { tradeupInfo: TradeupShareResolverService }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class TradeupCalculatorRoutingModule { }
