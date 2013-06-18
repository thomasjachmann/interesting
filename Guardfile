guard('sass', :input => 'src/sass', :output => 'css', :all_on_start => true)
guard('haml', :input => 'src/haml', :output => '.', :run_at_start => true) do
  watch(%r{^.+(\.haml)})
end
guard('jammit', :config_path => 'src/assets.yml', :output_folder => 'javascript', :package_on_start => true) do
  watch('src/assets.yml')
  watch(%r{^src/javascript/(.*)\.js$})
end
