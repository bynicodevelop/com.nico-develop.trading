import { IIndicator } from './iindicator';
import { Indicator } from './indicator';

describe('Indicator', () => {
  let indicator: Indicator;
  const mockIndicator1 = { name: 'test1', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
  const mockIndicator2 = { name: 'test2', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
  
  beforeEach(() => {
    indicator = new Indicator();
    indicator.addIndicator(mockIndicator1);
    indicator.addIndicator(mockIndicator2);
  });

  it('should add an indicator', () => {
    const mockIndicator = { name: 'test', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
    indicator.addIndicator(mockIndicator);
    expect(indicator['indicators']['test']).toBe(mockIndicator);
  });

  it('should call nextValue on all indicators', () => {
    indicator.nextValue(42);
    expect(mockIndicator1.nextValue).toHaveBeenCalledWith(42);
    expect(mockIndicator2.nextValue).toHaveBeenCalledWith(42);
  });

  it('should return all indicators', () => {
    const indicators = indicator.get();
    expect(indicators).toContain(mockIndicator1);
    expect(indicators).toContain(mockIndicator2);
  });

  it('should return an indicator by name', () => {
    const indicatorByName = indicator.get('test1');
    expect(indicatorByName).toBe(mockIndicator1);
  });

  it('should return undefined if indicator name is not found', () => {
    const indicatorByName = indicator.get('notfound');
    expect(indicatorByName).toBeUndefined();
  });
});
