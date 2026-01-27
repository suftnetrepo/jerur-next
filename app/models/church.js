
import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const addressSchema = new Schema({
  addressLine1: {
    type: String,
    required: false,
    default: '',
    max: 100
  },
  county: {
    type: String,
    default: '',
    max: 20
  },
  town: {
    type: String,
    required: false,
    default: '',
    max: 50
  },
  country: {
    type: String,
    required: true,
    min: 3,
    max: 20
  },
  country_code: {
    type: String,
    required: false,
    min: 3,
    max: 5
  },
  postcode: {
    type: String,
    required: false,
    default: '',
    max: 15
  },
  completeAddress: {
    type: String,
    required: false,
    default: '',
    max: 255
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    }
  }
})

const ChurchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    mobile: {
      type: String,
      trim: false,
      required: false,
      max: 50,
      default: ''
    },
    email: { type: String, unique: true, max: 50, lowercase: true },
    description: {
      type: String,
      min: 3,
      max: 2000,
      default: ''
    },
    address: {
      type: addressSchema,
      required: false
    },
    features: [String],
    sliders: [
      {
        title: {
          type: String,
          trim: true,
          default: ''
        },
        message: {
          type: String,
          trim: true,
          default: ''
        },
        status: {
          type: Boolean,
          default: true
        },
        imageOnly: {
          type: Boolean,
          default: false
        },
        secure_url: {
          type: String,
          required: false,
          default: ''
        },
        public_id: {
          type: String,
          required: false,
          default: ''
        }
      }
    ],
    contacts: [
      {
        title: {
          type: String,
          trim: true,
          default: ''
        },
        first_name: {
          type: String,
          trim: true,
          required: true
        },
        last_name: {
          type: String,
          trim: true,
          required: true
        },
        phone: {
          type: String,
          trim: true,
          default: ''
        },
        status: {
          type: Boolean,
          default: true
        }
      }
    ],
    push_notifications: [
      {
        title: {
          type: String,
          trim: true,
          default: ''
        },
        message: {
          type: String,
          trim: true,
          default: ''
        },
        status: {
          type: Boolean,
          default: true
        }
      }
    ],
    stripe_user_id: {
      type: String,
      trim: true,
      default: ''
    },
    currency: {
      type: String,
      trim: true,
      default: '£'
    },
    tax_rate: {
      type: Number,
      default: 0,
      max: 9
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: Date.now
    },
    trial_start: {
      type: Date,
      default: Date.now
    },
    trial_end: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      trim: true,
      default: ''
    },
    isSearchable: {
      type: Boolean,
      default: false
    },
    subscriptionId: {
      type: String,
      trim: true,
      default: ''
    },
    plan: {
      type: String,
      trim: true,
      default: ''
    },
    priceId: {
      type: String,
      trim: true,
      default: ''
    },
    stripeCustomerId: {
      type: String,
      trim: true,
      default: ''
    },
    fcm_token: {
      type: String,
      trim: true,
      required: false,
      default: ''
    },
    logo_url: {
      type: String,
      required: false,
      default: ''
    },
    logo_id: {
      type: String,
      required: false,
      default: ''
    },
    secure_url: {
      type: String,
      required: false,
      default: ''
    },
    public_id: {
      type: String,
      required: false,
      default: ''
    },
    sort_code: {
      type: String,
      required: false,
      default: ''
    },
    account_number: {
      type: String,
      required: false,
      default: ''
    },
    bank_name: {
      type: String,
      required: false,
      default: ''
    },
    reference: {
      type: String,
      required: false,
      default: ''
    },
    prayer_request_email: {
      type: String,
      required: false,
      default: ''
    },
    giving_url: {
      type: String,
      required: false,
      default: ''
    },
    enable_url_giving: {
      type: Boolean,
      required: false,
      default: false
    },
    enable_bank_transfer: {
      type: Boolean,
      required: false,
      default: false
    },
    enable_app_giving: {
      type: Boolean,
      required: false,
      default: false
    },
    facebook_url: {
      type: String,
      required: false,
      default: ''
    },
    instagram_url: {
      type: String,
      required: false,
      default: ''
    },
    youtube_url: {
      type: String,
      required: false,
      default: ''
    },
    prophetic_focus: {
      month: {
        type: String,
        required: false,
        default: ''
      },
      verse: {
        type: String,
        required: false,
        default: ''
      },
      description: {
        type: String,
        required: false,
        default: ''
      }
    },
    pastor_section :{
      title :{
        type: String,
        required: false,
        default: ''
      },
      first_name : {
        type: String,
        required: false,
        default: ''
      },
      last_name :{
        type: String,
        required: false,
        default: ''
      },
       description: {
        type: String,
        required: false,
        default: ''
      },
      public_id :{
        type: String,
        required: false,
        default: ''
      },
      secure_url :{
        type: String,
        required: false,
        default: ''
      }
    }

  },
  { timestamps: true }
)

ChurchSchema.index({ 'address.location': '2dsphere' })
ChurchSchema.index({
  name: 'text',
  'address.addressLine1': 'text',
  'address.town': 'text',
  'address.postcode': 'text'
})

const Church = mongoose.models.Church || mongoose.model('Church', ChurchSchema);
export default Church;