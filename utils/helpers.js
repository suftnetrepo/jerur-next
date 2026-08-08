import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const IV_LENGTH = 16; // For AES, this is always 16

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function generatePassword(passwordString) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(passwordString, salt);
}

async function comparePassword(password, hashString) {
  return bcrypt.compare(password, hashString);
}

const getAggregate = (data, status) => {
  {
    const result = (data || []).find((j) => j.status === status);
    return result ? result.count : 0;
  }
};

const getAdminAggregate = (data, status) => {
  {
    const result = (data || []).find((j) => j._id === status);
    return result ? result.count : 0;
  }
};

/**
 * Get dashboard aggregate value by property name
 * @param {Object} data - The aggregated data object with properties like events, members, fellowships, serviceTimes, total
 * @param {String} propName - The property name to retrieve (e.g., 'events', 'members', 'fellowships', 'serviceTimes', 'total')
 * @returns {Number} The value of the property, or 0 if not found
 */
const getDashboardAggregateValue = (data, propName) => {
  if (!data || typeof data !== 'object') {
    return 0;
  }
  return data[propName] || 0;
};

const dateFormatted = (str) => {
  const date0 = new Date(str);
  date0.setHours(date0.getHours() + 5);
  date0.setMinutes(date0.getMinutes() + 30);
  const month = `0${date0.getMonth() + 1}`.slice(-2);
  const day = `0${date0.getDate()}`.slice(-2);
  return [day, month, date0.getFullYear()].join('-');
};

function getSortedCounts(data) {
  if (!Array.isArray(data)) {
    throw new Error('Input must be an array');
  }

  data.sort((a, b) => a?._id.localeCompare(b?._id));
  return data.map((item) => item.count);
}

function convertDatesForMongoDB({ current_period_start, current_period_end }) {
  return {
    current_period_start: new Date(current_period_start * 1000), // Convert to milliseconds
    current_period_end: new Date(current_period_end * 1000) // Convert to milliseconds
  };
}

const formatUnixDate = (date = null, format) => {
  const dateFormat = dayjs.unix(date);
  return dateFormat.format(format);
};

const formatUnix = (date, format) => {
  const dateFormat = new Date(date * 1000).toString(format);
  return dateFormat;
};

const convertToUnixTimestamp = (timestampString) => {
  const timestamp = parseInt(timestampString) * 1000;
  return new Date(timestamp);
};

function convertToShortDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString(undefined, options);
}

function completeAddress(address) {
  if (!address) return;
  let completeAddress = '';

  if (address.addressLine1) {
    completeAddress += address.addressLine1 + ', ';
  }

  if (address.town) {
    completeAddress += address.town + ', ';
  }

  if (address.county) {
    completeAddress += address.county + ', ';
  }

  if (address.country) {
    completeAddress += address.country + ', ';
  }

  if (address.postcode) {
    completeAddress += address.postcode;
  }

  return completeAddress;
}

async function searchAddress(query) {
  const params = {
    q: query,
    format: 'json',
    addressdetails: 1,
    polygon_geojson: 0
  };

  const queryString = new URLSearchParams(params).toString();
  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${queryString}`, requestOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error while fetching address:', error);
    return null;
  }
}

function formatAddressParts(address) {
  const { suburb, city, state, postcode, country, country_code, place } = address;
  const addressPartsToInclude = [];

  if (country_code === 'us' || country_code === 'gb') {
    const postcodeOrZipCode = postcode || '';
    addressPartsToInclude.push(suburb, city, state, postcodeOrZipCode, country);
  } else {
    addressPartsToInclude.push(place, city, state, country);
  }

  return addressPartsToInclude.join(', ');
}

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    color: 'black'
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'white'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'white' : 'white',
    color: 'black',
    '&:hover': {
      backgroundColor: 'darkgray'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'black'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#808080'
  })
};

const addressStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    color: 'black'
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'black'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'white' : 'black',
    color: 'white',
    '&:hover': {
      backgroundColor: 'black'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'black'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#808080'
  })
};

const formatTimeForObject = (lastUpdated) => {
  if (lastUpdated && lastUpdated.seconds !== undefined) {
    const milliseconds = lastUpdated.seconds * 1000 + Math.floor(lastUpdated.nanoseconds / 1e6);
    const date = new Date(milliseconds);

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',

      hour12: false
    });

    return formattedTime;
  }

  return null;
};

function convertTimestampToTime(timestamp) {
  if (!timestamp) return;
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

const formatDateTime = (isoString) => {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    const json = await response.json();

    return formatAddressParts(json.address);
  } catch (error) { }
};

function formatCurrency(currencySymbol = '£', amount) {
  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount)) {
    return amount;
  }

  const formattedAmount = currencySymbol + numericAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

  return formattedAmount;
}

function currencySymbolMapper(currencySymbol) {
  const currencyMap = {
    '£': 'gbp',
    $: 'usd',
    aed: 'aed',
    afn: 'afn',
    all: 'all',
    amd: 'amd',
    usdc: 'usdc',
    btn: 'btn',
    ghs: 'ghs',
    eek: 'eek',
    lvl: 'lvl',
    svc: 'svc',
    vef: 'vef',
    ltl: 'ltl',
    sll: 'sll'
  };

  if (currencySymbol in currencyMap) {
    return currencyMap[currencySymbol];
  } else {
    return 'gbp';
  }
}

function formatReadableDate(isoDate) {
  const date = new Date(isoDate);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function checkAmount(amount) {
  if (amount && /\d/.test(amount)) {
    return amount;
  }
  return null;
}

function encrypt(text) {
  if (!text) return
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY || '946acb540311776067cadad0976d65c086673babcd8e8298b323ae85823f34b3', 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher?.update(text, 'utf8', 'hex');
    encrypted += cipher?.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

function decrypt(text) {
  if (!text) return null
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY || '946acb540311776067cadad0976d65c086673babcd8e8298b323ae85823f34b3', 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // NOTE: this used to `return text` here - i.e. silently hand the
    // caller back the original, still-encrypted (or just plain garbage)
    // string as if it had been decrypted. Every caller treats the return
    // value as a trusted Mongo id/church identifier with no further
    // validation, so that garbage went on to hit a database call and fail
    // there instead - a confusing 500 far from the real cause, instead of
    // a clean 401 here where the actual problem is. Callers must treat a
    // null return as "could not authenticate this request".
    console.error('Decryption error:', error);
    return null;
  }
}

const normalizeTime = (timeStr) => {
  const [h, m] = timeStr.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
};

const generateKey = () => crypto.randomBytes(32).toString('hex');

const getYesNoColorCode = (status) => {
  switch (status) {
    case true:
      return 'bg-success';
    case false:
      return 'bg-danger';
    default:
      return 'bg-danger';
  }
};

function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'active':
      return 'bg-success'; // Green
    case 'provisional':
      return 'bg-warning text-dark'; // Yellow
    case 'inactive':
      return 'bg-secondary'; // Gray
    case 'under discipline':
      return 'bg-danger'; // Red
    default:
      return 'bg-light text-dark'; // Default/fallback
  }
}
const serviceType = {
  'service': 'Service',
  'prayer': 'Prayer'
}

const STATUS_COLORS = {
  active: "#28a745",
  inactive: "#dc3545",
  "under discipline": "#f0ad4e",
  provisional: "#6f42c1",
};

const getStatusStyle = (status) => {
  const color =
    STATUS_COLORS[status?.toLowerCase()] || "#6c757d";

  return {
    backgroundColor: color,
    color: "#ffffff",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 500,
    textTransform: "capitalize",
  };
};

export {
  STATUS_COLORS,
  getStatusStyle,
  serviceType,
  capitalizeFirstLetter,
  getStatusBadgeClass,
  getYesNoColorCode,
  normalizeTime,
  encrypt,
  decrypt,
  generateKey,
  checkAmount,
  formatReadableDate,
  formatCurrency,
  currencySymbolMapper,
  reverseGeocode,
  convertTimestampToTime,
  formatTimeForObject,
  addressStyles,
  customStyles,
  getAdminAggregate,
  getDashboardAggregateValue,
  completeAddress,
  formatAddressParts,
  searchAddress,
  convertToShortDate,
  formatUnixDate,
  formatUnix,
  convertToUnixTimestamp,
  convertDatesForMongoDB,
  getAggregate,
  dateFormatted,
  getSortedCounts,
  formatDateTime,
  isValidObjectId,
  generatePassword,
  comparePassword
};
