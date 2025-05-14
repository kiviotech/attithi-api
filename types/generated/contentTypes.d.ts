import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    isEntryValid: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    user_role: Attribute.Enumeration<
      ['super-admin', 'donation', 'deeksha', 'guest-house', 'donation-admin']
    > &
      Attribute.DefaultTo<'deeksha'>;
    receipt_details: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::receipt-detail.receipt-detail'
    >;
    counter: Attribute.Enumeration<
      ['Counter 1', 'Counter 2', 'Counter 3', 'Counter 4']
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBlockBlock extends Schema.CollectionType {
  collectionName: 'blocks';
  info: {
    singularName: 'block';
    pluralName: 'blocks';
    displayName: 'Block';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    block_name: Attribute.String;
    rooms: Attribute.Relation<
      'api::block.block',
      'oneToMany',
      'api::room.room'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::block.block',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::block.block',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBookingRequestBookingRequest extends Schema.CollectionType {
  collectionName: 'booking_requests';
  info: {
    singularName: 'booking-request';
    pluralName: 'booking-requests';
    displayName: 'BookingRequest';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    status: Attribute.Enumeration<
      [
        'awaiting',
        'approved',
        'on_hold',
        'rejected',
        'confirmed',
        'rescheduled',
        'canceled'
      ]
    >;
    admin_comment: Attribute.Text;
    name: Attribute.String;
    age: Attribute.Integer;
    gender: Attribute.Enumeration<['M', 'F', 'Other']>;
    email: Attribute.Email;
    phone_number: Attribute.String;
    occupation: Attribute.String;
    aadhaar_number: Attribute.String;
    number_of_guest_members: Attribute.BigInteger;
    recommendation_letter: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    reason_for_revisit: Attribute.String;
    address: Attribute.Text;
    notifications: Attribute.Relation<
      'api::booking-request.booking-request',
      'oneToMany',
      'api::notification.notification'
    >;
    guest_house: Attribute.Relation<
      'api::booking-request.booking-request',
      'oneToOne',
      'api::guest-room.guest-room'
    >;
    guests: Attribute.Relation<
      'api::booking-request.booking-request',
      'oneToMany',
      'api::guest-detail.guest-detail'
    >;
    arrival_date: Attribute.Date;
    departure_date: Attribute.Date;
    number_of_male_devotees: Attribute.BigInteger;
    number_of_female_devotees: Attribute.BigInteger;
    additional_information: Attribute.Text;
    accommodation_requirements: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    rejection_reason: Attribute.Text;
    rejection_type: Attribute.Enumeration<
      [
        'noAvailability',
        'sixMonthRule',
        'specialCelebrationBelow10k',
        'specialCelebrationAbove10k',
        'custom'
      ]
    >;
    last_stay_date: Attribute.Date;
    celebration_type: Attribute.String;
    accommodation_type: Attribute.Enumeration<
      [
        'guestHouse',
        'dormitory',
        'yatriNivasRoom',
        'chinuShankhari',
        'peerlessFlat'
      ]
    >;
    deeksha: Attribute.String;
    room_allocations: Attribute.Relation<
      'api::booking-request.booking-request',
      'oneToMany',
      'api::room-allocation.room-allocation'
    >;
    dormitory: Attribute.Relation<
      'api::booking-request.booking-request',
      'manyToOne',
      'api::dormitory.dormitory'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::booking-request.booking-request',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::booking-request.booking-request',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCelebrationCelebration extends Schema.CollectionType {
  collectionName: 'celebrations';
  info: {
    singularName: 'celebration';
    pluralName: 'celebrations';
    displayName: 'Celebration';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    event_name: Attribute.Text;
    event_type: Attribute.Enumeration<['Birthday', 'Puja']>;
    hindu_date: Attribute.Text;
    gregorian_date: Attribute.Date;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::celebration.celebration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::celebration.celebration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCouponCoupon extends Schema.CollectionType {
  collectionName: 'coupons';
  info: {
    singularName: 'coupon';
    pluralName: 'coupons';
    displayName: 'coupon';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    running: Attribute.Integer & Attribute.DefaultTo<0>;
    total: Attribute.Integer & Attribute.DefaultTo<0>;
    special_coupon: Attribute.Integer & Attribute.DefaultTo<0>;
    date: Attribute.Date;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::coupon.coupon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::coupon.coupon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDataControlDataControl extends Schema.SingleType {
  collectionName: 'data_controls';
  info: {
    singularName: 'data-control';
    pluralName: 'data-controls';
    displayName: 'Data Control';
    description: 'API endpoints for data management operations';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    settings: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::data-control.data-control',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::data-control.data-control',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDeekshaDeeksha extends Schema.CollectionType {
  collectionName: 'deekshas';
  info: {
    singularName: 'deeksha';
    pluralName: 'deekshas';
    displayName: 'Deeksha';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Name: Attribute.String;
    Address: Attribute.Text;
    Pincode: Attribute.BigInteger;
    District: Attribute.String;
    State: Attribute.String;
    Country: Attribute.String;
    Phone_no: Attribute.BigInteger;
    Email: Attribute.Email & Attribute.DefaultTo<'dummy@example.com'>;
    Aadhar_no: Attribute.BigInteger;
    PAN_no: Attribute.String;
    Education: Attribute.Enumeration<
      [
        'Early childhood education',
        'Secondary education',
        'Higher education',
        'Undergraduate degree',
        'Post-graduate degree',
        'null'
      ]
    >;
    Occupation: Attribute.Text;
    Spouse_consent: Attribute.Boolean;
    Initiated_by_anyone: Attribute.Boolean;
    Family_Deeksha: Attribute.Boolean;
    Name_family_deeksha: Attribute.String;
    Relation: Attribute.Enumeration<
      [
        'Husband',
        'Wife',
        'Son',
        'Daughter',
        'Father',
        'Mother',
        'Mother-in-law',
        'Father-in-law',
        'Grandfather',
        'Grandmother',
        'null'
      ]
    >;
    Family_Deeksha_Guru: Attribute.Enumeration<
      ['Guru1', 'Guru2', 'Guru3', 'Guru4']
    >;
    Known_Guruji: Attribute.Boolean;
    Known_Guru_name: Attribute.Enumeration<
      ['Guru 1', 'Guru 2', 'Guru 3', 'Guru 4', 'null']
    >;
    Known_Guru_centre: Attribute.Enumeration<
      ['Centre1', 'Centre2', 'Centre3', 'Centre4', 'null']
    >;
    Waiting_for_Deeksha: Attribute.Integer;
    Books_read: Attribute.String;
    Practice_Deeksha: Attribute.Boolean;
    Disabilities: Attribute.Boolean;
    Hearing_Problems: Attribute.Boolean;
    Gender: Attribute.String;
    Marital_status: Attribute.Enumeration<
      ['Unmarried', 'Married', 'Widow', 'Widower']
    >;
    Care_Of: Attribute.String;
    status: Attribute.Enumeration<['approve', 'pending', 'reject']>;
    Booklet_language: Attribute.String;
    Languages_known: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::deeksha.deeksha',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::deeksha.deeksha',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDonationDonation extends Schema.CollectionType {
  collectionName: 'donations';
  info: {
    singularName: 'donation';
    pluralName: 'donations';
    displayName: 'donation';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    guest: Attribute.Relation<
      'api::donation.donation',
      'manyToOne',
      'api::guest-detail.guest-detail'
    >;
    donationAmount: Attribute.BigInteger;
    transactionType: Attribute.Enumeration<
      ['Cash', 'Cheque', 'Bank Transfer', 'DD', 'M.O']
    >;
    donationFor: Attribute.Enumeration<['Math', 'Mission']>;
    ddch_number: Attribute.String;
    ddch_date: Attribute.Date;
    bankName: Attribute.String;
    receipt_detail: Attribute.Relation<
      'api::donation.donation',
      'manyToOne',
      'api::receipt-detail.receipt-detail'
    >;
    status: Attribute.Enumeration<['completed', 'pending', 'cancelled']>;
    InMemoryOf: Attribute.String;
    purpose: Attribute.String;
    type: Attribute.String;
    branchName: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::donation.donation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::donation.donation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDonationAuditLogDonationAuditLog
  extends Schema.CollectionType {
  collectionName: 'donation_audit_logs';
  info: {
    singularName: 'donation-audit-log';
    pluralName: 'donation-audit-logs';
    displayName: 'Donation audit log';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    username: Attribute.String;
    userId: Attribute.BigInteger;
    donationId: Attribute.BigInteger;
    metadata: Attribute.JSON;
    timestamp: Attribute.DateTime;
    notes: Attribute.String;
    admin_user: Attribute.Relation<
      'api::donation-audit-log.donation-audit-log',
      'oneToOne',
      'admin::user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::donation-audit-log.donation-audit-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::donation-audit-log.donation-audit-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDormitoryDormitory extends Schema.CollectionType {
  collectionName: 'dormitories';
  info: {
    singularName: 'dormitory';
    pluralName: 'dormitories';
    displayName: 'Dormitory';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    occupancy: Attribute.Integer;
    rooms: Attribute.Relation<
      'api::dormitory.dormitory',
      'oneToMany',
      'api::room.room'
    >;
    female_occupancy: Attribute.Integer;
    male_occupacny: Attribute.Integer;
    booking_requests: Attribute.Relation<
      'api::dormitory.dormitory',
      'oneToMany',
      'api::booking-request.booking-request'
    >;
    status: Attribute.Enumeration<['available', 'occupied']>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::dormitory.dormitory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::dormitory.dormitory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFoodFood extends Schema.CollectionType {
  collectionName: 'foods';
  info: {
    singularName: 'food';
    pluralName: 'foods';
    displayName: 'Food';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    date: Attribute.Date;
    category: Attribute.Text;
    count: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::food.food', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::food.food', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiGuestDetailGuestDetail extends Schema.CollectionType {
  collectionName: 'guest_details';
  info: {
    singularName: 'guest-detail';
    pluralName: 'guest-details';
    displayName: 'Guest';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    phone_number: Attribute.String;
    occupation: Attribute.String;
    address: Attribute.Text;
    donations: Attribute.Relation<
      'api::guest-detail.guest-detail',
      'oneToMany',
      'api::donation.donation'
    >;
    booking_request: Attribute.Relation<
      'api::guest-detail.guest-detail',
      'manyToOne',
      'api::booking-request.booking-request'
    >;
    age: Attribute.Integer;
    gender: Attribute.Enumeration<['M', 'F', 'Other']>;
    status: Attribute.Enumeration<['approved', 'pending', 'rejected', 'none']>;
    relationship: Attribute.Enumeration<
      [
        'mother',
        'father',
        'son',
        'daughter',
        'wife',
        'aunt',
        'friend',
        'applicant',
        'other'
      ]
    >;
    arrival_date: Attribute.Date;
    departure_date: Attribute.Date;
    deeksha: Attribute.String;
    identity_proof: Attribute.String;
    identity_number: Attribute.String & Attribute.Required & Attribute.Unique;
    email: Attribute.String;
    unique_no: Attribute.String;
    pan_number: Attribute.String;
    room_allocations: Attribute.Relation<
      'api::guest-detail.guest-detail',
      'manyToMany',
      'api::room-allocation.room-allocation'
    >;
    arrival_status: Attribute.Enumeration<
      ['Not Arrived', 'Arrived', 'Cancelled', 'Rescheduled']
    > &
      Attribute.DefaultTo<'Not Arrived'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::guest-detail.guest-detail',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::guest-detail.guest-detail',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGuestRoomGuestRoom extends Schema.CollectionType {
  collectionName: 'guest_rooms';
  info: {
    singularName: 'guest-room';
    pluralName: 'guest-rooms';
    displayName: 'GuestHouse';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    location: Attribute.Text;
    total_floors: Attribute.Integer;
    total_rooms: Attribute.Integer;
    description: Attribute.Text;
    booking_request: Attribute.Relation<
      'api::guest-room.guest-room',
      'oneToOne',
      'api::booking-request.booking-request'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::guest-room.guest-room',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::guest-room.guest-room',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMessageTemplateMessageTemplate
  extends Schema.CollectionType {
  collectionName: 'message_templates';
  info: {
    singularName: 'message-template';
    pluralName: 'message-templates';
    displayName: 'MessageTemplate';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 5;
        maxLength: 20;
      }>;
    content: Attribute.Blocks;
    body: Attribute.String;
    channel: Attribute.Enumeration<['sms', 'email', 'whatsapp']>;
    notifications: Attribute.Relation<
      'api::message-template.message-template',
      'oneToMany',
      'api::notification.notification'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::message-template.message-template',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::message-template.message-template',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMigrationMigration extends Schema.CollectionType {
  collectionName: 'migrations';
  info: {
    singularName: 'migration';
    pluralName: 'migrations';
    displayName: 'Migration';
    description: 'Data migration logs and tracking';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    jobId: Attribute.String & Attribute.Required & Attribute.Unique;
    status: Attribute.Enumeration<
      ['processing', 'completed', 'failed', 'cancelled']
    > &
      Attribute.DefaultTo<'processing'>;
    progress: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 100;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    results: Attribute.JSON;
    logs: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::migration.migration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::migration.migration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNotificationNotification extends Schema.CollectionType {
  collectionName: 'notifications';
  info: {
    singularName: 'notification';
    pluralName: 'notifications';
    displayName: 'Notification';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    status: Attribute.Enumeration<['sent', 'pending']>;
    type: Attribute.Enumeration<
      [
        'Rejection',
        'Approval',
        'DONATION_EDITED',
        'DONATION_VERIFIED',
        'RECEIPT_EDITED',
        'info',
        'warning',
        'alert'
      ]
    >;
    title: Attribute.String;
    message: Attribute.Text;
    isRead: Attribute.Boolean & Attribute.DefaultTo<false>;
    sourceUserId: Attribute.Integer;
    sourceUserName: Attribute.String;
    sourceUserRole: Attribute.String;
    targetRoles: Attribute.JSON;
    resourceType: Attribute.String;
    resourceId: Attribute.Integer;
    booking_request: Attribute.Relation<
      'api::notification.notification',
      'manyToOne',
      'api::booking-request.booking-request'
    >;
    message_template: Attribute.Relation<
      'api::notification.notification',
      'manyToOne',
      'api::message-template.message-template'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOtpStorageOtpStorage extends Schema.CollectionType {
  collectionName: 'otp_storages';
  info: {
    singularName: 'otp-storage';
    pluralName: 'otp-storages';
    displayName: 'OTP Storage';
    description: 'Store temporary OTPs for login verification';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    phone_number: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        maxLength: 15;
      }>;
    otp: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
        maxLength: 6;
      }>;
    expires_at: Attribute.DateTime & Attribute.Required;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::otp-storage.otp-storage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::otp-storage.otp-storage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiReceiptDetailReceiptDetail extends Schema.CollectionType {
  collectionName: 'receipt_details';
  info: {
    singularName: 'receipt-detail';
    pluralName: 'receipt-details';
    displayName: 'ReceiptDetails';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Receipt_number: Attribute.String;
    donation_date: Attribute.Date;
    createdby: Attribute.Relation<
      'api::receipt-detail.receipt-detail',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    donations: Attribute.Relation<
      'api::receipt-detail.receipt-detail',
      'oneToMany',
      'api::donation.donation'
    >;
    counter: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::receipt-detail.receipt-detail',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::receipt-detail.receipt-detail',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiRoomRoom extends Schema.CollectionType {
  collectionName: 'rooms';
  info: {
    singularName: 'room';
    pluralName: 'rooms';
    displayName: 'room';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    room_number: Attribute.String;
    no_of_beds: Attribute.Integer;
    block: Attribute.Relation<
      'api::room.room',
      'manyToOne',
      'api::block.block'
    >;
    room_blockings: Attribute.Relation<
      'api::room.room',
      'oneToMany',
      'api::room-blocking.room-blocking'
    >;
    dormitory: Attribute.Relation<
      'api::room.room',
      'manyToOne',
      'api::dormitory.dormitory'
    >;
    room_allocations: Attribute.Relation<
      'api::room.room',
      'oneToMany',
      'api::room-allocation.room-allocation'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::room.room', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::room.room', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiRoomAllocationRoomAllocation extends Schema.CollectionType {
  collectionName: 'room_allocations';
  info: {
    singularName: 'room-allocation';
    pluralName: 'room-allocations';
    displayName: 'RoomAllocation';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    room_status: Attribute.Enumeration<['available', 'allocated', 'occupied']>;
    room: Attribute.Relation<
      'api::room-allocation.room-allocation',
      'manyToOne',
      'api::room.room'
    >;
    guests: Attribute.Relation<
      'api::room-allocation.room-allocation',
      'manyToMany',
      'api::guest-detail.guest-detail'
    >;
    occupancy: Attribute.Integer;
    booking_request: Attribute.Relation<
      'api::room-allocation.room-allocation',
      'manyToOne',
      'api::booking-request.booking-request'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::room-allocation.room-allocation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::room-allocation.room-allocation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiRoomBlockingRoomBlocking extends Schema.CollectionType {
  collectionName: 'room_blockings';
  info: {
    singularName: 'room-blocking';
    pluralName: 'room-blockings';
    displayName: 'RoomBlocking';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    reason_for_blocking: Attribute.Text;
    room: Attribute.Relation<
      'api::room-blocking.room-blocking',
      'manyToOne',
      'api::room.room'
    >;
    room_block_status: Attribute.Enumeration<
      ['blocked', 'unblocked', 'cleaning underway', 'maintenance']
    >;
    from_date: Attribute.Date;
    to_date: Attribute.Date;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::room-blocking.room-blocking',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::room-blocking.room-blocking',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiUserActivityLogUserActivityLog
  extends Schema.CollectionType {
  collectionName: 'user_activity_logs';
  info: {
    singularName: 'user-activity-log';
    pluralName: 'user-activity-logs';
    displayName: 'user-activity-log';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    action: Attribute.String;
    username: Attribute.String;
    userRole: Attribute.String;
    ipAddress: Attribute.String;
    userAgent: Attribute.String;
    details: Attribute.JSON;
    notes: Attribute.String;
    timestamp: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-activity-log.user-activity-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::user-activity-log.user-activity-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'api::block.block': ApiBlockBlock;
      'api::booking-request.booking-request': ApiBookingRequestBookingRequest;
      'api::celebration.celebration': ApiCelebrationCelebration;
      'api::coupon.coupon': ApiCouponCoupon;
      'api::data-control.data-control': ApiDataControlDataControl;
      'api::deeksha.deeksha': ApiDeekshaDeeksha;
      'api::donation.donation': ApiDonationDonation;
      'api::donation-audit-log.donation-audit-log': ApiDonationAuditLogDonationAuditLog;
      'api::dormitory.dormitory': ApiDormitoryDormitory;
      'api::food.food': ApiFoodFood;
      'api::guest-detail.guest-detail': ApiGuestDetailGuestDetail;
      'api::guest-room.guest-room': ApiGuestRoomGuestRoom;
      'api::message-template.message-template': ApiMessageTemplateMessageTemplate;
      'api::migration.migration': ApiMigrationMigration;
      'api::notification.notification': ApiNotificationNotification;
      'api::otp-storage.otp-storage': ApiOtpStorageOtpStorage;
      'api::receipt-detail.receipt-detail': ApiReceiptDetailReceiptDetail;
      'api::room.room': ApiRoomRoom;
      'api::room-allocation.room-allocation': ApiRoomAllocationRoomAllocation;
      'api::room-blocking.room-blocking': ApiRoomBlockingRoomBlocking;
      'api::user-activity-log.user-activity-log': ApiUserActivityLogUserActivityLog;
    }
  }
}
