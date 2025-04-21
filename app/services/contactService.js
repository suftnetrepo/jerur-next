import { contactValidator } from '../validation/contactValidator';
import { identifierValidator, identifierValidators } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import Church from '../models/church';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

const addContact = async (suid, body) => {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = contactValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const church = await Church.findByIdAndUpdate(suid, { $push: { contacts: body } }, { new: true });

    const newContact = church.contacts[church.contacts.length - 1];
    return newContact;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding contact');
  }
};

const updateContact = async (contactId, body, suid) => {
  const { title, status, first_name,last_name, phone } = body;

  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = contactValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Church.updateOne(
      { suid, 'contacts._id': contactId },
      {
        $set: {
          'contacts.$.first_name': first_name,
          'contacts.$.last_name': last_name,
          'contacts.$.title': title,
          'contacts.$.phone': phone,
          'contacts.$.status': status
        }
      }
    ).exec();

    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating contact');
  }
};

const removeContact = async (suid, contactId) => {
  try {
    const identifierValidateResult = identifierValidators([{ suid }, { contactId }]);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Church.findByIdAndUpdate(suid, { $pull: { contacts: { _id: contactId } } }, { new: true }).exec();

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting contacts');
  }
};
const getFilteredAndSortedContacts = (contacts) =>
  contacts.filter((contact) => contact.status === true).sort((a, b) => b.createdAt - a.createdAt);

const getAllContacts = async (suid, status = false) => {
  const identifierValidationErrors = identifierValidator(suid);
  if (identifierValidationErrors.length) {
    const error = new Error(identifierValidationErrors.map((it) => it.message).join(','));
    error.invalidArgs = identifierValidationErrors.map((it) => it.field).join(',');
    throw error;
  }

  try {
    const church = await Church.findById(suid);

    return status
      ? getFilteredAndSortedContacts(church.contacts)
      : church.contacts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching contacts');
  }
};

export { addContact, updateContact, removeContact, getAllContacts };
