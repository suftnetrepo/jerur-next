import { NextPage } from 'next';
import { Fragment } from 'react';
import { Navbar } from '../../src/components/blocks/navbar';
import PageProgress from '../../src/components/common/PageProgress';
import Link from 'next/link';
import { Footer } from '../../src/components/blocks/footer';
import Features from '../../src/components/blocks/service';

const Feature: NextPage = () => {
  return (
    <Fragment>
      <PageProgress />

      <header className="wrapper bg-light">
        <Navbar
          info
          navOtherClass="navbar-other ms-lg-4"
          navClassName="navbar navbar-expand-lg classic transparent navbar-light"
          button={
            <Link href="/login" className="btn btn-sm text-white btn-primary rounded-pill">
              Sign In
            </Link>
          }
        />
      </header>

      <main className="content-wrapper">
        <section className="wrapper bg-soft-primary">
          <div className="container pt-10  pt-md-14 pb-md-14 text-center">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-12 mx-auto">
                <h1 className="display-1 mb-3">Features</h1>
                <p className="lead mb-0 px-xl-10 px-xxl-13">
                  Manage members, services, events, giving and content from the church dashboard, then choose what your
                  members can access through the mobile app.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="wrapper mt-12">
          <div className="container pb-14 pb-md-16">
            <Features show={false} />
          </div>
        </section>
      </main>
      <Footer />
    </Fragment>
  );
};

export default Feature;
