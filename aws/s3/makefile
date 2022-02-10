.PHONY: clean package deploy

clean:
	rm -f .template.yaml

package: clean
	sam package --template-file template.yaml --s3-bucket mmg-cf --output-template-file .template.yaml

deploy: package
	AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=ia \
	sam deploy \
	--stack-name ia-s3-audiofiles-dev \
	--template-file .template.yaml \
	
deploy-prod: package
	AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=ia \
	sam deploy \
	--stack-name ia-s3-audiofiles-prod \
	--template-file .template.yaml \
	--capabilities CAPABILITY_IAM \
	--parameter-overrides Environment=prod \
	