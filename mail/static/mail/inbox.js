function send_mail(event) {
  event.preventDefault();
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    const submitError = result.error;
    if (submitError) {
      compose_email(submitError);
    }
    else {
      load_mailbox('sent');
    }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // Submit email
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
  
});


function compose_email(submitError = null) {

  // Scroll to top of the page
  window.scrollTo(0, 0);

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Display error message
  if (submitError) {
    document.querySelector('#submit-error').innerHTML = `<div class="alert alert-danger" role="alert">${submitError}</div>`;
  }
  else {
    document.querySelector('#submit-error').innerHTML = '';
  }
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Clear mailbox to prevent duplication
  const emailsView = document.querySelector('#emails-view');
  emailsView.innerHTML = '';

  // Show the mailbox name
  const mailboxName = document.createElement('div');
  mailboxName.id = 'mailbox-heading';
  emailsView.appendChild(mailboxName);
  document.querySelector('#mailbox-heading').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails in the mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // Total number of emails
      const n = emails.length;

      // Start with first email
      let counter = 0;

      // Load 13 emails at a time
      const quantity = 13;
      let end = counter + quantity;

      // Load 13 emails first
      emails.slice(counter, end).forEach(email => create_email(email, mailbox));

      // Load more emails upon scrolling
      window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
          if (counter < n) {
            counter = end;
            end = counter + quantity;
            emails.slice(counter, end).forEach(email => create_email(email, mailbox));
          }
        }
      };
  });
}


function create_email(contents, mailbox) {

  // Create a div for each email
  const email = document.createElement('div');
  email.className = 'email';
  email.id = contents.id;

  // Check if email is read
  if (contents.read != false) {
    email.style.backgroundColor = "#CCCCCC";
  }

  // Display recipients for sent mailbox
  if (mailbox === 'sent') {
    const recipients = document.createElement('div');
    const n = contents.recipients.length;
    recipients.className = 'recipients';
    if (n > 1) {
      recipients.innerHTML = `${contents.recipients[0]} &${n - 1} more`;
    }
    else {
      recipients.innerHTML = `${contents.recipients[0]}`;
    }
    email.appendChild(recipients);
  }

  // Display sender for inbox
  else {
    const sender = document.createElement('div');
    sender.className = 'sender';
    sender.innerHTML = contents.sender;
    email.appendChild(sender);
  }

  // Create divs for rest of elements
  const subject = document.createElement('div');
  subject.className = 'subject';
  subject.innerHTML = contents.subject;

  const timestamp = document.createElement('div');
  timestamp.className = 'timestamp';
  timestamp.innerHTML = contents.timestamp;

  // Append to email div
  email.appendChild(subject);
  email.appendChild(timestamp);
  email.addEventListener('click', (event) => view_email(event, mailbox));
  document.querySelector('#emails-view').append(email);
}

function view_email(event, mailbox) {

  // Show the mail and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';

  // Get ID of email which was clicked
  const emailId = event.target.id;

  // Access email
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Fill each field of email
      document.querySelector('#view-sender').innerHTML = `<b>From:</b> ${email.sender}`;
      document.querySelector('#view-recipients').innerHTML = `<b>To:</b> ${email.recipients}`;
      document.querySelector('#view-subject').innerHTML = `<b>Subject:</b> ${email.subject}`;
      document.querySelector('#view-timestamp').innerHTML = `<b>Timestamp:</b> ${email.timestamp}`;
      document.querySelector('#view-body').innerHTML = email.body;

      // Prevent duplication of buttons
      const emailButtons = document.querySelector("#email-buttons");
      emailButtons.innerHTML = '';

      if (mailbox != 'sent') {
        // Allow user to reply to email
        const reply = document.createElement('button');
        reply.className = "btn btn-sm btn-outline-primary";
        reply.id = "reply-email";
        emailButtons.appendChild(reply);
        reply.innerHTML = 'Reply';
        reply.addEventListener('click', () => reply_email(email.id));

        // Add archive option for inbox
        const archive = document.createElement('button');
        archive.className = "btn btn-sm btn-outline-primary";
        archive.id = "archive-email";
        emailButtons.appendChild(archive)
        if (email.archived === true) {
          archive.innerHTML = 'Unarchive';
          archive.addEventListener('click', () => archive_email(emailId, false));
        }
        else {
          archive.innerHTML = 'Archive';
          archive.addEventListener('click', () => archive_email(emailId, true));
        }
      }
  });

  // Mark email as read
  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function archive_email(emailId, archived) {
  // Mark email as archived
  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: archived
    })
  });
  load_mailbox('inbox');
}

function reply_email(emailId) {
  // Access email
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#view-email').style.display = 'none';

      // Pre-fill composition fields
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;
  });
}
