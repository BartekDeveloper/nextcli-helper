import { ReactNode } from "react";

const Loading = ({ loading }: { loading: boolean|null }): ReactNode => {
  return (
    <>
      {loading && <div>Loading...</div>}
    </>
  );
}

const Error = ({ error }: { error: string|null }): ReactNode => {
  return (
    <>
      {error && <div>Error: {error}</div>}
    </>
  );
}

interface OutData {
  i: number,
  d: any
}
const DisplayObject = ({
  data, Out
} : { data: any, Out: React.ComponentType<OutData> }): React.ReactNode => {
  return (
    <>
    {(data) && data.map((d: any|any[], i: number) => <Out key={i} i={i} d={d} />)}
    </>
  );
}

export {
  Loading,
  Error,
  DisplayObject,
  type OutData
}