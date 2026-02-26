const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function fn_ident(body) {
  const email = body.email ? body.email.toLowerCase().trim() : null;
  const phone = body.phoneNumber ? String(body.phoneNumber).trim() : null;

  if (!email && !phone) {
    throw new Error("email_or_phone_required");
  }

  // Find contacts with same email or phone
  const contacts = await db.contact.findMany({
    where: {
      OR: [
        email ? { email } : {},
        phone ? { phoneNumber: phone } : {}
      ]
    }
  });

  // If none found → create primary
  if (contacts.length === 0) {
    const newContact = await db.contact.create({
      data: {
        email,
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

  // Find primary (oldest one)
  let primary = contacts.find(c => c.linkPrecedence === "primary");
  if (!primary) primary = contacts[0];

  // Check if new info needs secondary
  const emailExists = contacts.some(c => c.email === email);
  const phoneExists = contacts.some(c => c.phoneNumber === phone);

  if ((email && !emailExists) || (phone && !phoneExists)) {
    await db.contact.create({
      data: {
        email,
        phoneNumber: phone,
        linkPrecedence: "secondary",
        linkedId: primary.id
      }
    });
  }

  // Get all contacts linked to this primary
  const all = await db.contact.findMany({
    where: {
      OR: [
        { id: primary.id },
        { linkedId: primary.id }
      ]
    }
  });

  return {
    contact: {
      primaryContactId: primary.id,
      emails: [...new Set(all.map(c => c.email).filter(Boolean))],
      phoneNumbers: [...new Set(all.map(c => c.phoneNumber).filter(Boolean))],
      secondaryContactIds: all
        .filter(c => c.linkPrecedence === "secondary")
        .map(c => c.id)
    }
  };
}

module.exports = { fn_ident };