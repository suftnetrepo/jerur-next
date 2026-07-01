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

            <div className="d-flex flex-wrap gap-3 mb-5" style={slideInDownAnimate('1000ms')}>
              <NextLink title="Get Started" href="/pricing" className="btn btn-primary btn-lg px-5 rounded-pill" />

              <NextLink title="Watch Demo" href="#" className="btn btn-outline-dark btn-lg px-5 rounded-pill" />
            </div>
            <div className="d-flex align-items-left" style={slideInDownAnimate('1200ms')}>
             

              <div className="ms-0">
                <div className="fw-bold">
                  Trusted by <span className="text-primary">500+</span> Churches
                </div>

                <small className="text-muted">Growing ministry communities worldwide</small>
              </div>
            </div>
          </div>

          <div className="col-lg-7 position-relative mt-5 mt-lg-0">
            {/* Church image */}

            <div
              className="position-absolute"
              style={{
                top: -40,
                right: -20,
                width: '70%',
                zIndex: 1
              }}
            >
              <img
                src="/img/hero/hero.avif"
                className="img-fluid rounded-5 shadow"
                alt=""
              />
            </div>

            {/* Laptop */}

            <div
              className="position-relative"
              style={{
                zIndex: 2,
                ...zoomInAnimate('300ms')
              }}
            >
              <img
                src="/img/hero/hero_2.png"
                className="img-fluid rounded-5 shadow-lg"
                alt=""
              />
            </div>

            {/* Phone */}

            <div
              className="position-absolute"
              style={{
                right: 40,
                bottom: -30,
                width: 180,
                zIndex: 3
              }}
            >
              <img
                src="/img/hero/hero_3.png"
                className="img-fluid rounded-5 shadow-lg"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
