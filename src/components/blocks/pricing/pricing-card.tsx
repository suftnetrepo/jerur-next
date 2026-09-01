import { FC } from 'react';
import Price from './price';
import NextLink from '../../reuseable/links/NextLink';

// ================================================================
type PricingCardProps = {
  planName: string;
  features: string[];
  yearlyPrice: number;
  monthlyPrice: number;
  priceId: string;
  live_priceId: string;
  activeYearly: boolean;
  roundedButton?: boolean;
  Icon: (props: any) => JSX.Element;
  raw_price: number;
  duration : string;
  displayName?: string;
  description?: string;
  badge?: string;
};
// ================================================================


const PricingCard: FC<PricingCardProps> = (props) => {
    const { planName, displayName, description, badge, features, duration, raw_price, live_priceId, priceId, activeYearly, Icon } = props;

    const yearClasses = activeYearly ? 'price-show' : 'price-hide price-hidden';
    const monthClasses = !activeYearly ? 'price-show' : 'price-hide price-hidden';
    const checkout_priceId = process.env.NEXT_PUBLIC_ENV === 'production' || process.env.NODE_ENV === 'production'
      ? live_priceId
      : priceId;

    return (
      <div className="pricing card shadow-lg text-center bg-link">
        <div className="card-body px-8 ">
          <Icon />

          {badge && <span className="badge bg-pale-primary text-primary rounded-pill mb-3">{badge}</span>}
          <h4 className="card-title text-dark">{displayName || planName}</h4>
          {description && <p className="text-muted mb-4">{description}</p>}

          <div className="prices text-dark">
            <Price duration={duration} value={raw_price} classes={monthClasses} />
            <Price duration={duration} value={raw_price} classes={yearClasses} />
          </div>

          <ul className="icon-list bullet-bg bullet-soft-primary mt-7 mb-8 text-start">
            {features.map((item, i) => (
              <li key={i}>
                <i className="uil uil-check" />
                <span className="text-dark">{item}</span>
              </li>
            ))}
          </ul>

          <NextLink
            href={`/checkout/${checkout_priceId}`}
            title={`Choose ${displayName || planName}`}
            className={`text-white btn text-white btn-primary rounded-pill`}
          />
        </div>
      </div>
    );
};

export default PricingCard;
