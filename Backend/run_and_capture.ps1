$ErrorActionPreference = "Continue"
mvn spring-boot:run 2>&1 | Tee-Object -FilePath "full_output.log"
