import { FC } from 'react';
import Typewriter from 'typewriter-effect';
import { slideInDownAnimate, zoomInAnimate } from '../../../utils/animation';
import NextLink from '../../reuseable/links/NextLink';

const Hero: FC = () => {
  const OPTIONS = {
    loop: true,
    autoStart: true,
    strings: [
      'grow your church',
      'inspire your members',
      'reach new hearts',
      'nurture discipleship',
      'lead with confidence'
    ]
  };

  return (
    <section className="">
      <div className=" pt-10 pb-12 pt-md-8 pb-md-17">
        <div className="row gx-lg-8 gx-xl-12 gy-10 align-items-center">
          <div className="col-md-10 offset-md-1 offset-lg-0 col-lg-5 mt-lg-n2 text-center text-lg-start order-2 order-lg-0">
            <h1 className="display-1 mb-5 mx-md-10 mx-lg-0" style={slideInDownAnimate('600ms')}>
              Bring Your Church Together—Online and In Person. <br />
              <span className="typer text-primary text-nowrap">
                <Typewriter options={OPTIONS} />
              </span>
            </h1>

            <p className="lead fs-lg mb-7" style={slideInDownAnimate('900ms')}>
              Connect members, manage events, and keep your church thriving—anytime, anywhere, on any device.
            </p>

            <div className="d-flex justify-content-start align-items-center">
              <span style={slideInDownAnimate('1200ms')}>
                <NextLink title="Get Started" href="/pricing" className="btn btn-lg btn-primary rounded me-2" />
              </span>
            </div>
          </div>

          <div className="col-lg-7">
            <div
              className="col-12 col-lg-12 d-flex justify-content-end align-items-center"
              style={zoomInAnimate('3ms')}
            >
              <img className=" img-fluid " src="/img/photos/sa16.jpg" srcSet="/img/hero/right_image.png" alt="demo" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
