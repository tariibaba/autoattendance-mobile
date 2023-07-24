import { format } from 'date-fns';

export function universalDateFormat(date: Date) {
  return format(date, "d MMM yyyy 'at' h:mm a");
}
