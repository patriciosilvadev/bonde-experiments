import MailchimpClient from 'mailchimp-api-v3';
import crypto from 'crypto';
import { Activist, Widget } from './types';

interface MailchimpArgs {
  activist: Activist;
  widget: Widget;
}

class Mailchimp {
  protected client: any;
  protected activist: any;
  protected widget: any;
  protected listID: string

  constructor({ activist, widget }: MailchimpArgs) {  
    const {
      mailchimp_api_key,
      mailchimp_list_id
    } = widget.block.mobilization.community;

    this.client = new MailchimpClient(mailchimp_api_key);
    this.listID = mailchimp_list_id;
    this.activist = activist;
    this.widget = widget;
  }

  get tags () {
    const { id, kind, block: { mobilization } } = this.widget;
    return [
      // TAG COMMUNITY
      'C' + mobilization.community.id,
      // TAG MOBILIZATION
      'M' + mobilization.id,
      // TAG WIDGET KIND
      kind.toUpperCase().substring(0,1) + '' + id
    ]
  }

  get hash () {
    return crypto
      .createHash('md5')
      .update(this.activist.email.toLowerCase())
      .digest('hex');
  }

  subscribe (): Promise<any> {
    const form = {
      "email_address": this.activist.email,
      "status": "subscribed",
      "merge_fields": {
        "FNAME": this.activist.first_name || this.activist.name,
        "LNAME": this.activist.last_name || this.activist.name,
        // "ADDRESS": "",
        // "PHONE": "",
        // "BIRTHDAY": ""
      },
      "tags": this.tags
    }
    
    return this.client.put({
      path: `/lists/${this.listID}/members/${this.hash}`,
      body: form
    })
    .then((response: any) => {
      console.log('response', response);
      return 'Teste'
    })
    .catch((err: any) => {
      console.log('err', err);
    })
  }
}

export default Mailchimp;