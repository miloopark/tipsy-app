const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withFirebasePodfile(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf-8');

        // Check if we already added the Firebase fix
        if (!podfileContent.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {

          // Find the post_install block and add our fix at the beginning
          const firebaseFixCode = `    # Fix for React Native Firebase non-modular headers
    installer.pods_project.targets.each do |target|
      if target.name.start_with?('RNFB')
        target.build_configurations.each do |config|
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
      end
    end
`;

          // Look for post_install do |installer| and insert code right after it
          podfileContent = podfileContent.replace(
            /post_install do \|installer\|\s*\n/,
            `post_install do |installer|\n${firebaseFixCode}`
          );

          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added Firebase non-modular headers fix to post_install hook');
        }
      }

      return config;
    },
  ]);
};
