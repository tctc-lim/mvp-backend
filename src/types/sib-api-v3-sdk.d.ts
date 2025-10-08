declare module 'sib-api-v3-sdk' {
  export class ApiClient {
    static instance: {
      authentications: {
        'api-key': {
          apiKey: string;
        };
      };
    };
  }

  export class SendSmtpEmail {
    subject: string;
    htmlContent: string;
    sender: {
      name: string;
      email: string;
    };
    to: Array<{
      email: string;
    }>;
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<any>;
  }
}
