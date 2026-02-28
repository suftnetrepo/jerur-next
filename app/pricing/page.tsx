import { NextPage } from 'next';
import { Fragment } from 'react';
import { Navbar } from '../../src/components/blocks/navbar';
import Pricing from '../../src/components/blocks/pricing';
import PageProgress from '../../src/components/common/PageProgress';
import Link from 'next/link';
import Topbar from '../../src/components/elements/Topbar';
import { Footer } from '../../src/components/blocks/footer';
import FAQ from '../../src/components/blocks/faq';


const PricePlans: NextPage = () => {
  return (
    <Fragment>
      <PageProgress />

      <header className="wrapper bg-light">
        <Navbar
          info
          navOtherClass="navbar-other ms-lg-4"
          navClassName="navbar navbar-expand-lg classic transparent navbar-light"
          button={
            <Link href="/login" className="btn btn-sm text-white bg__purple rounded-pill">
              Sign In
            </Link>
          }
        />
      </header>

      <main className="content-wrapper">
        <section className="wrapper bg-soft-primary">
          <div className="container pt-10  pt-md-14 pb-md-14 text-center">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-9 mx-auto">
                <h1 className="display-1 mb-3">Our Pricing</h1>
                <p className="lead mb-0 px-xl-10 px-xxl-13">
                  No matter which plan you choose, you’ll enjoy cost savings, exceptional features, and trusted
                  support—all designed for your success.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="wrapper mt-12">
          
          <div className="container pb-14 pb-md-16">
            <Pricing show={false} />
          </div>

          <FAQ />
        </section>
      </main>
      <Footer />
    </Fragment>
  );
};

export default PricePlans;
