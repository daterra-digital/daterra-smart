import fs from 'node:fs';

const ptAuth = {
  signInTitle: "Entrar na DATERRA Smart",
  signUpTitle: "Criar Conta DATERRA Smart",
  confirmEmailTitle: "Confirmar E-mail",
  subtitleForm: "Acesso seguro através de conta Google ou link enviado para o seu e-mail.",
  subtitleSent: "Enviámos um link mágico de acesso para {{email}}",
  subtitleConfirm: "Confirme o seu e-mail para concluir a autenticação neste dispositivo.",
  tabSignIn: "Entrar",
  tabSignUp: "Registo",
  googleSignIn: "Continuar com a Google",
  or: "ou",
  firstNameLabel: "Nome",
  firstNamePlaceholder: "Nome",
  lastNameLabel: "Apelido",
  lastNamePlaceholder: "Apelido",
  companyLabel: "Entidade / Exploração",
  companyPlaceholder: "Nome da empresa ou exploração agrícola",
  emailLabel: "E-mail",
  emailPlaceholder: "utilizador@exemplo.pt",
  btnProcessing: "A processar...",
  btnComplete: "Concluir Acesso",
  btnSendLink: "Enviar Link de Acesso",
  sentCheckInbox: "Abra a sua caixa de correio e clique no botão",
  sentButtonHighlight: "Entrar na DATERRA Smart",
  changeData: "Alterar dados",
  resendLink: "Reenviar link",
  resendCountdown: "Reenviar ({{count}}s)",
  firebaseSecurityBadge: "Autenticação segura Firebase (Google & Magic Link)",
  invalidEmailError: "Por favor introduza um endereço de e-mail válido.",
  fillRequiredError: "No registo, preencha Nome, Apelido, E-mail e Entidade.",
  linkSentSuccess: "Link de acesso enviado para o seu e-mail!"
};

const enAuth = {
  signInTitle: "Sign In to DATERRA Smart",
  signUpTitle: "Create DATERRA Smart Account",
  confirmEmailTitle: "Confirm Email",
  subtitleForm: "Secure access via Google account or magic link sent to your email.",
  subtitleSent: "We sent a magic sign-in link to {{email}}",
  subtitleConfirm: "Confirm your email to complete authentication on this device.",
  tabSignIn: "Sign In",
  tabSignUp: "Register",
  googleSignIn: "Continue with Google",
  or: "or",
  firstNameLabel: "First Name",
  firstNamePlaceholder: "First name",
  lastNameLabel: "Last Name",
  lastNamePlaceholder: "Last name",
  companyLabel: "Entity / Farm",
  companyPlaceholder: "Company or farm name",
  emailLabel: "Email",
  emailPlaceholder: "user@example.com",
  btnProcessing: "Processing...",
  btnComplete: "Complete Sign In",
  btnSendLink: "Send Access Link",
  sentCheckInbox: "Open your inbox and click the button",
  sentButtonHighlight: "Sign In to DATERRA Smart",
  changeData: "Change details",
  resendLink: "Resend link",
  resendCountdown: "Resend ({{count}}s)",
  firebaseSecurityBadge: "Secure Firebase authentication (Google & Magic Link)",
  invalidEmailError: "Please enter a valid email address.",
  fillRequiredError: "For registration, please fill First Name, Last Name, Email and Entity.",
  linkSentSuccess: "Access link sent to your email!"
};

const ptFiles = ['src/i18n/locales/pt-PT.json', 'src/i18n/locales/pt.json'];
const enFiles = ['src/i18n/locales/en-GB.json', 'src/i18n/locales/en.json'];

for (const f of ptFiles) {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  json.auth = ptAuth;
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Updated ${f}`);
}

for (const f of enFiles) {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  json.auth = enAuth;
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Updated ${f}`);
}
