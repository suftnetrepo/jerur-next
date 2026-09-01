import { NextPage } from 'next';

const AboutUs: NextPage = () => {
  return (
    <>
      <section id="about">
        <div className="wrapper bg-white">
          <div className="container py-14 py-md-16">
            <div className="row gx-md-8 gx-xl-12 gy-6 align-items-center">
              <div className="col-md-8 col-lg-5 order-lg-2 mx-auto">
                <img className="img-fluid" src="/img/photos/sa23.png" srcSet="/img/photos/sa23@2x.png 2x" alt="" />
              </div>

              <div className="col-lg-7">
                <h2 className="display-5 mb-3">About Us</h2>
                <p className="lead">
                  Jerur is Suftnet's church management and member engagement platform. It brings church profiles,
                  members, attendance, services, events, giving, campaigns and ministry content into one web dashboard,
                  while giving each church control over the features members see in the mobile app. Our aim is simple:
                  reduce administration, keep church information current and make it easier for members to stay connected.
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
