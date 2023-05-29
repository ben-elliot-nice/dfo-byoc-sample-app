import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum([
    'apple-apps-reviews',
    'apple-business-chat',
    'bg',
    'bw',
    'chat',
    'congstar-forum',
    'custom',
    'cypress',
    'discussions',
    'email',
    'facebook',
    'fb',
    'fm',
    'forum',
    'gcse',
    'gl',
    'google-business-messages',
    'google-places',
    'google-play',
    'google-rcs',
    'gp',
    'ig',
    'in-contact-email',
    'ind',
    'instagram',
    'kik',
    'lc',
    'li',
    'line',
    'mediatoolkit',
    'microsoft-teams',
    'mock',
    'monitora',
    'news',
    'nw',
    'ok-ru',
    'phpbb',
    'rss',
    'sandbox',
    'sandbox-facebook',
    'sandbox-twitter',
    'sendbird',
    'slack',
    'smooch-io-we-chat',
    'sms',
    'social-watch',
    't-mobile-austria-forum',
    'talkdesk',
    'telegram',
    'tmobile-forum',
    'tw',
    'twitter',
    'viber',
    'vk',
    'vo',
    'voice',
    'we-chat',
    'whatsapp',
    'youscan',
    'yt',
    'zoom',
  ])
  realExternalPlatformId: string;

  @IsNotEmpty()
  @IsBoolean()
  isPrivate: boolean;

  @IsNotEmpty()
  @IsBoolean()
  hasTreeStructure: boolean;
}
