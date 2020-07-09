import logger from './logger';
import { IBaseAction } from './resolvers';
import * as actions from './api/actions';
import * as notifications from './api/notifications';


export const pressure = async ({ widget, activist }: IBaseAction<any>): Promise<any> => {
  const { targets, pressure_subject, pressure_body, } = widget.settings;

  const mailInput = targets.split(';').map((target: string) => ({
    context: { activist, widget },
    body: pressure_body,
    subject: pressure_subject,
    email_from: `${activist.name} <${activist.email}>`,
    email_to: target
  }));

  await notifications.send(mailInput);
  logger.child({ mailInput }).info('send pressure mail to targerts')

  const { id } = await actions.pressure({
    activist_id: activist.id,
    widget_id: widget.id,
    cached_community_id: widget.block.mobilization.community.id
  });
  logger.child({ id }).info('save pressure on database');

  return [
    { id },
    async () => await actions.pressure_sync_done({ id, sync_at: new Date().toISOString() })
  ];
}