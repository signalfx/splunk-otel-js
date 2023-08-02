{
  "targets": [{
    "target_name": "metrics",
    "variables": {
      "cppstd_ver_linux": "<!(node -pe \"parseInt(process.versions.node.split('.')[0]) >= 20 ? '17' : '11'\")"
      "cppstd_ver_mac": "<!(node -pe \"parseInt(process.versions.node.split('.')[0]) >= 20 ? '17' : '14'\")"
    },
    "sources": [
      "src/native_ext/util/arena.cpp",
      "src/native_ext/util/hex.cpp",
      "src/native_ext/module.cpp",
      "src/native_ext/metrics.cpp",
      "src/native_ext/memory_profiling.cpp",
      "src/native_ext/profiling.cpp",
      "src/native_ext/util/modp_numtoa.cpp",
      "src/native_ext/util/platform.cpp"
    ],
    "include_dirs": [
      "<!(node -e \"require('nan')\")"
    ],
    "conditions": [
      ["OS == 'linux'", {
        "cflags": [
          "-std=c++<(cppstd_ver_linux)",
          "-Wall",
          "-Werror"
        ],
        "cflags_cc": [
          "-Wno-attributes",
          "-Wno-deprecated-declarations"
        ]
      }],
      ["OS == 'win'", {
        "cflags": [
          "/WX"
        ],
        "defines": [
          "NOMINMAX"
        ]
      }],
      ["OS == 'mac'", {
        "xcode_settings": {
          "MACOSX_DEPLOYMENT_TARGET": "10.10",
          "OTHER_CFLAGS": [
            "-std=c++<(cppstd_ver_mac)",
            "-stdlib=libc++",
            "-Wall",
            "-Werror",
            "-Wno-deprecated-declarations"
          ]
        },
      }],
    ]
  }]
}
