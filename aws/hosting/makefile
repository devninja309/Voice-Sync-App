#Run Make deploy to run this

.PHONY: clean package deploy

clean:
	rm -f .template.yaml

package: clean
	sam package --template-file template.yaml --s3-bucket s3-ia-cfg --output-template-file .template.yaml

deploy: package
	AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=ia \
	sam deploy \
	--stack-name ia-static-hosting-qa \
	--template-file .template.yaml \
	--parameter-overrides \
	Subdomain=portal.qa \
	APIGatewayURL=ffo9tmh1jh.execute-api.us-west-2.amazonaws.com \
	
deploy-prod: package
	AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=ia \
	sam deploy \
	--stack-name ia-static-hosting-prod \
	--template-file .template.yaml \
	--capabilities CAPABILITY_IAM \
	--parameter-overrides \
	Subdomain=portal \
	APIGatewayURL=lp1d80anfd.execute-api.us-west-2.amazonaws.com \
	