const { withEntitlementsPlist } = require('@expo/config-plugins');

const APP_GROUP_KEY = 'com.apple.security.application-groups';

module.exports = function withSharedState(config, props = {}) {
  const appGroupIdentifier = props.appGroupIdentifier || 'group.com.percenttime';

  return withEntitlementsPlist(config, (configWithEntitlements) => {
    const entitlements = configWithEntitlements.modResults;
    const current = Array.isArray(entitlements[APP_GROUP_KEY])
      ? entitlements[APP_GROUP_KEY]
      : [];

    if (!current.includes(appGroupIdentifier)) {
      entitlements[APP_GROUP_KEY] = [...current, appGroupIdentifier];
    }

    return configWithEntitlements;
  });
};
