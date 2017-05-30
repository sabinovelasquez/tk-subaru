# Subaru

Desafio Subaru. Construida con [Ionic Framework](http://ionicframework.com/).

## Para desarrollar
### Setup

1. Instalar [Ionic](http://ionicframework.com/docs/overview/#download): `$ npm install -g ionic`
2. Gulp: `npm install -g gulp`

### Correr

- Instalar dependencias `npm install`
- Instalar dependencias `bower install`

### En Web

- Correr localmente en browser `ionic serve`

### En Emulador

- Agregar la plataforma `ionic platform add <ios o android>`
- Construir `ionic build <ios o android>`
- Deploy en emulador `ionic emulate <ios o android>`

Se puede probar en navegador, emulador Android, simulados iOS y en dispositivos iOS registrados o Android. [Más información](http://ionicframework.com/docs/guide/testing.html).

## Para testear en dispositivo

Se puede probar la aplicación sin tener el ambiente de desarrollo y sin pasar por las tiendas de Android y iOS instalando [Ionic View](http://view.ionic.io/).

PASS KEYSTORE: subarutk

### GENERATE UNSIGNED APK
 `cordova build --release android`

### SIGN CURRENT APK
`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore subaru-tk.keystore platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk alias_subaru `

IF there is builded apk remove it
`rm platforms/android/build/outputs/apk/subarutk-release.apk `

### ZIPALIGN SIGNED APK
`~/Library/Android/sdk/build-tools/23.0.2/zipalign  -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk  platforms/android/build/outputs/apk/subarutk-release.apk  `
