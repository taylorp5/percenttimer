Pod::Spec.new do |s|
  s.name = 'shared-state'
  s.version = '1.0.0'
  s.summary = 'Shared state bridge for PercentTimer widgets.'
  s.description = 'Exposes shared app state to native widgets via Expo Modules.'
  s.homepage = 'https://example.invalid'
  s.license = { :type => 'MIT' }
  s.author = { 'Taylor Pinto' => 'taylor.pinto@example.invalid' }
  s.platforms = { :ios => '13.0' }
  s.source = { :path => '.' }
  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.swift_version = '5.0'
  s.dependency 'ExpoModulesCore'
end
