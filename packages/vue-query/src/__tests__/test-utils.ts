/* istanbul ignore file */

export function flushPromises(timeout = 0): Promise<unknown> {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout)
  })
}

export function simpleFetcher(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve('Some data')
    }, 0)
  })
}

export function getSimpleFetcherWithReturnData(returnData: unknown) {
  return () =>
    new Promise((resolve) => setTimeout(() => resolve(returnData), 0))
}

export function infiniteFetcher({
  pageParam,
}: {
  pageParam?: number
}): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve('data on page ' + pageParam)
    }, 0)
  })
}

export function rejectFetcher(): Promise<Error> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      return reject(new Error('Some error'))
    }, 0)
  })
}

export function successMutator<T>(param: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve(param)
    }, 0)
  })
}

export function errorMutator<T>(_: T): Promise<Error> {
  return rejectFetcher()
}

// `initialData` can be `optional property` or `required property`.
// These can be denoted with prefixes `p` and `r`, respectively.
// Possible values are `undefined`, `()=>undefined`, `TData|undefined`, `()=>TData|undefined`, `TData`, `()=>TData`.
// Each presence can be represented as a bit.
// Combinations result in examples like:
// ex)
// {initialData ?: undefined} => p100000
// {initialData : (()⇒TData|undefined) | TData} => r000110

// For reference,
// if the prefix is `r` && at least one of the last two bits is 1 && all bits except the last two are 0,
// it should be `DefinedInitialQueryOptions`
// otherwise, it should be `UndefinedInitialQueryOptions`.

type Bit = '0' | '1'
type OptionalPrefix = 'p' | 'r'
type InitialDataCode = `${OptionalPrefix}${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}`
type StringTuple<TString extends string> =
  TString extends `${infer Start}${infer Rest}`
    ? [Start, ...StringTuple<Rest>]
    : []

type InitialDataType<TData, TTuple extends Array<string>> =
  | (TTuple[1] extends '1' ? undefined : never)
  | (TTuple[2] extends '1' ? () => undefined : never)
  | (TTuple[3] extends '1' ? TData | undefined : never)
  | (TTuple[4] extends '1' ? () => TData | undefined : never)
  | (TTuple[5] extends '1' ? TData : never)
  | (TTuple[6] extends '1' ? () => TData : never)

type InitialDataOption<
  TData,
  TCode extends InitialDataCode,
  TTuple extends Array<string> = StringTuple<TCode>,
> = TTuple[0] extends 'p'
  ? { initialData?: InitialDataType<TData, TTuple> }
  : { initialData: InitialDataType<TData, TTuple> }

export function getInitQueryOption<TData, TCode extends InitialDataCode>(
  data: TData,
) {
  const defaultOption: { queryKey: ['key']; queryFn: () => TData } = {
    queryKey: ['key'],
    queryFn: () => data,
  }
  return defaultOption as TCode extends `${'p' | 'r'}000000`
    ? typeof defaultOption
    : typeof defaultOption & InitialDataOption<TData, TCode>
}
