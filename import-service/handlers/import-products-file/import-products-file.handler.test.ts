import { APIGatewayProxyEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { IMPORT_SERVICE_BUCKET, UPLOAD_DIRECTORY } from '../../common/config';
import { buildBody } from '../../common/lambda-results-builder';

import { importProductsFile } from "./import-products-file.handler";

jest.mock('aws-sdk');

const MockS3 = S3 as jest.MockedClass<
  typeof S3
>;

describe("Import products file", () => {
  it("should generate signed link", async () => {
    const testUrl = "testUrl";
    const mockGetSignedUrlPromise = jest.fn(() => {
      return Promise.resolve(testUrl);
    });

    MockS3.mockImplementationOnce(() => ({
      getSignedUrlPromise: mockGetSignedUrlPromise
    }) as unknown as S3);
    const fileName = "testFile";
    const event = ({ queryStringParameters: { name: fileName } } as unknown) as APIGatewayProxyEvent;

    const result = await importProductsFile(event, null, null);

    expect(mockGetSignedUrlPromise).toHaveBeenCalledTimes(1);
    expect(mockGetSignedUrlPromise).toHaveBeenCalledWith("putObject", {
      Bucket: IMPORT_SERVICE_BUCKET,
      Key: `${UPLOAD_DIRECTORY}/${fileName}`,
      Expires: 60,
      ContentType: "text/csv",
    });
    expect(result).toMatchObject({
      statusCode: 200,
      body: buildBody({ url: testUrl })
    });
  });

  it("should sent 500 if there is any error", async () => {
    const mockGetSignedUrlPromise = jest.fn(() => {
      return Promise.reject();
    });

    MockS3.mockImplementationOnce(() => ({
      getSignedUrlPromise: mockGetSignedUrlPromise
    }) as unknown as S3);
    const fileName = "testFile";
    const event = ({ queryStringParameters: { name: fileName } } as unknown) as APIGatewayProxyEvent;

    const result = await importProductsFile(event, null, null);

    expect(mockGetSignedUrlPromise).toHaveBeenCalledTimes(1);
    expect(mockGetSignedUrlPromise).toHaveBeenCalledWith("putObject", {
      Bucket: IMPORT_SERVICE_BUCKET,
      Key: `${UPLOAD_DIRECTORY}/${fileName}`,
      Expires: 60,
      ContentType: "text/csv",
    });
    expect(result).toMatchObject({
      statusCode: 500,
    });
  });
});
