import { FC } from 'react';
import data from '@/data/demo-27';

const Steps: FC = () => {
  return (
    <div className="container pt-13 pb-15 pb-md-17 py-lg-16 ps-lg-15 pe-xxl-16">
      <h2 className="fs-15 text-uppercase text-muted mb-3 text-center">How It Works?</h2>
      <h3 className="display-4 mb-10 px-lg-12 px-xl-15 text-center">
        Here are the 4 Steps from buying a plan to onboarding.
      </h3>
      <div className="row gx-lg-8 gx-xl-12 gy-10 align-items-center">
        <div className="col-md-6 col-lg-6 mt-lg-n2 text-center text-lg-start order-2 order-lg-0">
          <figure className="rounded">
            <img className=" img-fluid " src="/img/photos/sa24.png" srcSet="/img/photos/sa24.png" alt="demo" />
          </figure>
        </div>

        <div className="col-lg-6 col-md-6">
          {data.processList.map(({ id, Icon, title, description }) => (
            <div className="d-flex flex-row mb-5" key={id}>
              <div>
                <Icon className="icon-svg-md text-blue me-5 mt-1" />
              </div>
              <div>
                <h4 className="fs-20 ls-sm">{title}</h4>
                <p className="mb-0">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Steps;
