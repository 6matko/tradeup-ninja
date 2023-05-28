import { TestBed } from '@angular/core/testing';
import { FloatToConditionPipe } from './float-to-condition.pipe';
describe('FloatToConditionPipe', () => {
  let pipe: FloatToConditionPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FloatToConditionPipe] });
    pipe = TestBed.inject(FloatToConditionPipe);
  });

  it('can load instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms 0.05 to 0.05 (FN)', () => {
    const value: any = '0.05';
    const args: string[] = [];
    expect(pipe.transform(value, args)).toEqual('0.05 (FN)');
  });

  it('transforms 0.1 to 0.1 (MW)', () => {
    const value: any = '0.1';
    const args: string[] = [];
    expect(pipe.transform(value, args)).toEqual('0.1 (MW)');
  });

  it('transforms 0.26 to 0.26 (FT)', () => {
    const value: any = '0.26';
    const args: string[] = [];
    expect(pipe.transform(value, args)).toEqual('0.26 (FT)');
  });

  it('transforms 0.4 to 0.4 (WW)', () => {
    const value: any = '0.4';
    const args: string[] = [];
    expect(pipe.transform(value, args)).toEqual('0.4 (WW)');
  });

  it('transforms 0.5 to 0.5 (BS)', () => {
    const value: any = '0.5';
    const args: string[] = [];
    expect(pipe.transform(value, args)).toEqual('0.5 (BS)');
  });

  it('transforms value out of 0-1 (15 for example) range to ???', () => {
    const value: any = '15';
    const args: string[] = [];
    expect(pipe.transform(value, args)).toEqual('15 (???)');
  });
});
