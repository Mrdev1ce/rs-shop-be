import { S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import {Readable} from 'stream';
import { IMPORT_SERVICE_BUCKET, PARSED_DIRECTORY, UPLOAD_DIRECTORY } from '../../common/config';

import { parseProducts } from "./parse-products.handler";

jest.mock('aws-sdk');

const MockS3 = S3 as jest.MockedClass<
  typeof S3
>;


const testCSV = [
  "title,description,price,count",
  "Test title,Test Description,12,62"
].join("\n");

describe("Parse products", () => {
  it("should parse and move file", async () => {
    const record1 = {
      s3: {
        object: {
          key: `${UPLOAD_DIRECTORY}/testKey`
        }
      }
    };
    const mockCreateReadStream = jest.fn(() => {
      return Readable.from(testCSV);
    });
    const mockGetObject = jest.fn(() => {
      return { createReadStream: mockCreateReadStream};
    });
    const mockCopyObject = jest.fn(() => {
      return {promise: () => Promise.resolve()}
    });
    const mockDeleteObject = jest.fn(() => {
      return {promise: () => Promise.resolve()}
    });

    MockS3.mockImplementationOnce(() => ({
      getObject: mockGetObject,
      copyObject: mockCopyObject,
      deleteObject: mockDeleteObject
    }) as unknown as S3);
    const event = ({ Records: [record1] } as unknown) as S3Event;

    await parseProducts(event, null, null);

    expect(mockGetObject).toHaveBeenCalledTimes(1);
    expect(mockGetObject).toHaveBeenCalledWith({
      Bucket: IMPORT_SERVICE_BUCKET,
      Key: record1.s3.object.key
    });
    expect(mockCopyObject).toHaveBeenCalledTimes(1);
    expect(mockCopyObject).toHaveBeenCalledWith({
      CopyFrom: `${IMPORT_SERVICE_BUCKET}/${record1.s3.object.key}`,
      Bucket: IMPORT_SERVICE_BUCKET,
      Key: `${PARSED_DIRECTORY}/${record1.s3.object.key}`
    });
    expect(mockDeleteObject).toHaveBeenCalledTimes(1);
    expect(mockDeleteObject).toHaveBeenCalledWith({
      Bucket: IMPORT_SERVICE_BUCKET,
      Key: record1.s3.object.key,
    })
  });
});
