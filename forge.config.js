module.exports = {
  packagerConfig: {
    icon: './public/salestrackr.ico',
    asar: {}

  },
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-zip',
    //   config: (arch) => ({
    //     macUpdateManifestBaseUrl: `https://my-bucket.s3.amazonaws.com/my-app-updates/darwin/${arch}`
    //   })
    // },
    {
      name: '@electron-forge/maker-squirrel',
      config: (arch) => ({
        remoteReleases: `https://wirt-io--trackr-digital.s3.us-west-002.backblazeb2.com/taco`,
      })
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {
        setupIcon: './public/salestrackr.ico'
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-s3',
      config: {
        bucket: 'wirt-io--trackr-digital',
        public: true,
        // endpoint: 'https://s3.us-west-002.backblazeb2.com',
        // region: 'us-west-002',
        // secretAccessKey:'K002kRoTOA+jNVN96j06dFHMRdMNGHw',
        // accessKeyId:'0024b8664f6ead70000000012'
      }
    }
  ]
};
