import { FC } from 'react';

type Props = {
  fullscreen?: boolean;
};

export const Loading: FC<Props> = ({ fullscreen = false }) => {
  return fullscreen ? (
    <div className="fullscreen-spinner">
      <Spinner />
    </div>
  ) : (
    <Spinner />
  );
};

function Spinner() {
  return (
    <div className="loading">
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
