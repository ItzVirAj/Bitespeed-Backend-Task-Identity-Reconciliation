const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function fn_ident(body) {

  // normalize input
  const email = body.email ? body.email.toLowerCase().trim() : null;
  const phone = body.phoneNumber ? String(body.phoneNumber).trim() : null;

  // basic validation
  if (!email && !phone) {
    throw new Error("email_or_phone_required");
  }

  // build conditions
  const conditions = [];

  if (email) {
    conditions.push({ email: email });
  }

  if (phone) {
    conditions.push({ phoneNumber: phone });
  }

  // find direct matches
  const contacts = await db.contact.findMany({
    where: {
      OR: conditions
    }
  });

  // no existing contact
  if (contacts.length === 0) {

    const newContact = await db.contact.create({
      data: {
        email: email,
        phoneNumber: phone,
        linkPrecedence: "primary"
      }
    });

    return {
      contact: {
        primaryContactId: newContact.id,
        emails: email ? [email] : [],
        phoneNumbers: phone ? [phone] : [],
        secondaryContactIds: []
      }
    };
  }

  // collect all related ids
  const relatedIds = new Set();

  for (let i = 0; i < contacts.length; i++) {

    relatedIds.add(contacts[i].id);

    if (contacts[i].linkedId) {
      relatedIds.add(contacts[i].linkedId);
    }
  }

  // fetch full cluster
  const fullCluster = await db.contact.findMany({
    where: {
      OR: [
        { id: { in: Array.from(relatedIds) } },
        { linkedId: { in: Array.from(relatedIds) } }
      ]
    }
  });

  // find primary contacts
  const primaryContacts = fullCluster.filter(
    c => c.linkPrecedence === "primary"
  );

  let primary;

  // multiple primary case
  if (primaryContacts.length > 1) {

    primaryContacts.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    primary = primaryContacts[0];

    for (let i = 1; i < primaryContacts.length; i++) {
      await db.contact.update({
        where: { id: primaryContacts[i].id },
        data: {
          linkPrecedence: "secondary",
          linkedId: primary.id
        }
      });
    }

  }
  // single primary
  else if (primaryContacts.length === 1) {

    primary = primaryContacts[0];

  }
  // only secondary matched
  else {

    const first = fullCluster[0];

    if (first.linkedId) {
      primary = await db.contact.findUnique({
        where: { id: first.linkedId }
      });
    } else {
      primary = first;
    }
  }

  // check existing values
  const emailExists = fullCluster.some(c => c.email === email);
  const phoneExists = fullCluster.some(c => c.phoneNumber === phone);

  // create secondary if needed
  if ((email && !emailExists) || (phone && !phoneExists)) {
    await db.contact.create({
      data: {
        email: email,
        phoneNumber: phone,
        linkPrecedence: "secondary",
        linkedId: primary.id
      }
    });
  }

  // fetch final cluster
  const finalCluster = await db.contact.findMany({
    where: {
      OR: [
        { id: primary.id },
        { linkedId: primary.id }
      ]
    }
  });

  // build response
  const emails = [];
  const phoneNumbers = [];
  const secondaryIds = [];

  finalCluster.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  for (let i = 0; i < finalCluster.length; i++) {

    if (finalCluster[i].email && !emails.includes(finalCluster[i].email)) {
      emails.push(finalCluster[i].email);
    }

    if (finalCluster[i].phoneNumber && !phoneNumbers.includes(finalCluster[i].phoneNumber)) {
      phoneNumbers.push(finalCluster[i].phoneNumber);
    }

    if (finalCluster[i].linkPrecedence === "secondary") {
      secondaryIds.push(finalCluster[i].id);
    }
  }

  return {
    contact: {
      primaryContactId: primary.id,
      emails: emails,
      phoneNumbers: phoneNumbers,
      secondaryContactIds: secondaryIds
    }
  };
}

module.exports = { fn_ident };