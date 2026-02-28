'use client';

import { Fragment } from 'react';
import type { NextPage } from 'next';
import PageProgress from '../src/components/common/PageProgress';
import { Footer } from '../src/components/blocks/footer';
import  Hero2  from '../src/components/blocks/hero/Hero';
import useLightBox from '../src/hooks/useLightBox';
import { Navbar } from '../src/components/blocks/navbar';
import FAQ from '../src/components/blocks/faq';
import Link from 'next/link';
import Topbar from '../src/components/elements/Topbar';
import Features from '../src/components/blocks/service';
import Steps from '../src/components/blocks/steps';
import Pricing from '../src/components/blocks/pricing';
import Contact from '../src/components/elements/contact';
import Testimonial from '../src/components/blocks/testimonial';


const Home: NextPage = () => {
  useLightBox();

  return (
    <Fragment>
      <PageProgress />

      {/* <Topbar /> */}
      <header className="wrapper bg-light">
        <Navbar
          info
          navOtherClass="navbar-other ms-lg-4"
          navClassName="navbar navbar-expand-lg classic transparent navbar-light"
          button={
            <Link href="/login" className="btn btn-sm btn-primary rounded-pill">
              Sign In
            </Link>
          }
        />
      </header>

      <main className="content-wrapper">
        <section className="wrapper bg-white">
          <div className="container pt-8 pt-md-14">
            <Hero2 />
          </div>
          <Features />
          <Steps />
          <div className="pt-15 pt-md-17 bg-light">
            <Pricing />          
          </div>
          <div className="container pt-15 pt-md-17 pb-13 pb-md-15 mb-n14">
          <Testimonial />
          </div>
          <FAQ />
          <Contact />
        </section>
      </main>
   
      <Footer />
    </Fragment>
  );
};

export default Home;
