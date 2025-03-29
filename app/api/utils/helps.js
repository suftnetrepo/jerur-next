
import mongoose from 'mongoose';
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


async function generatePassword(passwordString) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(passwordString, salt);
}

async function comparePassword(password, hashString) {
  return bcrypt.compare(password, hashString);
}

function clearCookie(res, key) {
  res.clearCookie(key);
}

const generateRandomKey = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(32, (error, buf) => {
      if (error) {
        return reject(error);
      }
      const token = buf.toString('hex');
      return resolve(token);
    });
  });

const getAggregate = (data, status) => {
  {
    const result = (data || []).find((j) => j._id === status);
    return result ? result.count : 0;
  }
};

const dateFormatted = (str) => {
  const date0 = new Date(str);
  date0.setHours(date0.getHours() + 5);
  date0.setMinutes(date0.getMinutes() + 30);
  const month = `0${date0.getMonth() + 1}`.slice(-2);
  const day = `0${date0.getDate()}`.slice(-2);
  return [day, month, date0.getFullYear()].join('-');
};

function convertToUnix(dateString) {
  const date = new Date(dateString);
  const unixTimestamp = date.getTime();
  return unixTimestamp;
}

function convertFromUnix(unixTimestamp) {
  const formattedDate = new Date(unixTimestamp * 1000);
  return formattedDate;
}

const converterTimeStampToDate = (timestamp) => {
  const formattedDate = new Date(parseInt(timestamp));
  return formattedDate;
};

export {
  getAggregate,
  dateFormatted,
  isValidObjectId,
  generatePassword,
  generateRandomKey,
  clearCookie,
  comparePassword,
  convertToUnix,
  convertFromUnix,
  converterTimeStampToDate,
};
