import axios from 'axios';

export const client = axios.create({
  baseURL: 'https://web-base-dev.agilres.net/api',
  headers: {
    'X-API-Key':
      'GNUj1mZYuKKIWMSONR0VCzNbwJPnCaj1EZVPbSP7RC6VcWtiPIE3CzToBCTRgCMU',
    'X-Mobile-App':
      'dy5K225i3j2PIfjNW5bK1BsyCjLUb0fM9mq1i2RqNbWrx662PEFSzVEhIFHrqaaq',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});
