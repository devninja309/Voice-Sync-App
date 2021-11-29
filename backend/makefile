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
	--stack-name ia-api-qa \
	--template-file .template.yaml \
	--capabilities CAPABILITY_IAM
	@echo "🏗Deploying✅"

deploy-prod: package
	@echo "⚠️PRODUCTION⚠️"
	@echo "🏗Deploying"
	AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=ia \
	sam deploy \
	--stack-name ia-api-prod \
	--template-file .template.yaml \
	--capabilities CAPABILITY_IAM \
	--parameter-overrides Env=prod 
	@echo "🏗Deploying✅"