import { NextPage } from 'next';
import { Fragment } from 'react';
import { Navbar } from '../../src/components/blocks/navbar';
import PageProgress from '../../src/components/common/PageProgress';
import Link from 'next/link';
import { Footer } from '../../src/components/blocks/footer';
import Features from '../../src/components/blocks/service';
import Testimonial from '../../src/components/blocks/testimonial';

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
              <div className="col-sm-12 col-md-12 col-lg-12 mx-auto">
                <h1 className="display-1 mb-3">Features</h1>
                <p className="lead mb-0 px-xl-10 px-xxl-13">
                  We exist to strengthen churches through technology that understands ministry. With features like
                  automated follow-ups and giving analytics, we help turn your God-given vision into measurable impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="wrapper mt-12">
          <div className="container pb-14 pb-md-16">
            <Features show={false} />
          </div>
          <div className='bg-gray'>
          <div className=" container  pt-15 pt-md-17 pb-13 pb-md-15 mb-n14">
            <Testimonial />
          </div>
          </div>
         
        </section>
      </main>
      <Footer />
    </Fragment>
  );
};

export default Feature;
