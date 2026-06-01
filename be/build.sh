rm -rf src/main/resources/static

cd ../fe
npm run build

mv dist ../be/src/main/resources/static

cd ../be

./gradlew bootjar

scp -i src/main/resources/secret/key1121.pem build/libs/be-0.0.1-SNAPSHOT.jar ubuntu@43.201.70.26:./prj.jar
ssh -i src/main/resources/secret/key1121.pem ubuntu@43.201.70.26 './run.sh'