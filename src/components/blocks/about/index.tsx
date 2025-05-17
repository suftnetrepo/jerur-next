import { NextPage } from 'next';
import Image from 'next/image';

const AboutUs: NextPage = () => {
  return (
    <>
      <section id="about">
        <div className="wrapper bg-white">
          <div className="container py-14 py-md-16">
            <div className="row gx-md-8 gx-xl-12 gy-6 align-items-center">
              <div className="col-md-8 col-lg-5 order-lg-2 mx-auto">
                <div className="img-mask mask-2">
                  <Image width={1000} height={850} src="/img/photos/sa23.png" alt="" />
                </div>
              </div>

              <div className="col-lg-7">
                <h2 className="display-5 mb-3">About Us</h2>
                <p className="lead">
                  Suftnet is the technology partner behind your church app, delivering innovative solutions designed to
                  empower ministries in today’s digital landscape. With a team of experienced IT professionals, we
                  specialize in creating scalable, user-friendly platforms that support churches of all sizes. From
                  member engagement and service scheduling to digital giving and livestreaming, our solutions are built
                  to enhance connection, streamline operations, and drive growth. At Suftnet, our mission is to equip
                  churches with modern tools that simplify ministry, strengthen community, and amplify impact.
                </p>
                <p></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
