.PHONY: clean build package deploy

clean:
	@echo "🧹Cleaning"
	rm -f .template.yaml
	rm -rf dist
	rm -rf .webpack
	@echo "🧹Cleaning✅"

build: clean
	@echo "🛠Building"
	yarn webpack
	@echo skipping "cp -R ./node_modules/ ./.webpack/node_modules"
	@echo "🛠Building✅"

package: build
	@echo "📦Packaging"
	AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=ia \
	sam package --template-file template.yaml --s3-bucket s3-ia-cfg --output-template-file .template.yaml
	@echo "📦Packaging✅"

deploy: package
	@echo "🏗Deploying"
	AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=ia \
	sam deploy \
	--stack-name ia-queue-api-qa \
	--template-file .template.yaml \
	--parameter-overrides Env=qa \
	--capabilities CAPABILITY_IAM 
	@echo "🏗Deploying✅"

deploy-prod: package
	@echo "⚠️PRODUCTION⚠️"
	@echo "🏗Deploying"
	AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=ia \
	sam deploy \
	--stack-name ia-queue-api-prod \
	--template-file .template.y \
	--parameter-overrides Env=prod \
	--capabilities CAPABILITY_IAM 
	@echo "🏗Deploying✅"

	@echo "Don't forget to check the VPC to make sure it didn't get dropped"
