import { FC } from 'react';

const Footer8: FC = () => {
  return (
    <footer className="bg-white">
    <div className="container pt-13 pb-7">
      <div className="row gx-lg-0 gy-6">
        <div className="col-lg-4">
          <div className="widget">
            <img className="mb-4" src="/img/logo.png" srcSet="/img/logo.png" alt="Jerur" />
            <p className="lead mb-0">
              Jerur helps churches manage ministry from one web dashboard and connect members through a configurable mobile experience.
            </p>
          </div>
        </div>

        <div className="col-lg-3 offset-lg-2">
          <div className="widget">
            <div className="d-flex flex-row">
              <div>
                <div className="icon text-primary fs-28 me-4 mt-n1">
                  <i className="uil uil-phone-volume" />
                </div>
              </div>

              <div>
                <h5 className="mb-1">Phone</h5>
                <p className="mb-0">
                  (+44)-020 8144 3161
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="widget">
            <div className="d-flex flex-row">
              <div>
                <div className="icon text-primary fs-28 me-4 mt-n1">
                  <i className="uil uil-location-pin-alt" />
                </div>
              </div>

              <div className="align-self-start justify-content-start">
                <h5 className="mb-1">Address</h5>
                <address>The Gatehouse 453 Cranbrook Road, Woodford Green IG2 6EW. United Kingdom</address>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="mt-11 mt-md-12 mb-7" />
      <div className="d-md-flex align-items-center justify-content-between">
        <p className="mb-2 mb-lg-0">© {new Date().getFullYear()} Suftnet. All rights reserved.</p>
        <div className="d-flex gap-4">
          <a href="/privacyPolicy" className="link-body">Privacy Policy</a>
          <a href="/termsAndCondition" className="link-body">Terms &amp; Conditions</a>
          <a href="/contact" className="link-body">Contact</a>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer8;
