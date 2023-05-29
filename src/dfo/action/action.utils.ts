import { HttpStatus, Logger } from '@nestjs/common';

export const handleFailure = function (message, redirectUrl, response) {
  Logger.warn(message);
  if (redirectUrl) {
    response.redirect(302, redirectUrl);
  } else {
    response.status(HttpStatus.FORBIDDEN).send('Access Forbidden');
  }
};
