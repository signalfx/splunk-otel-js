/*
 * Copyright Splunk Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as typeorm from 'typeorm';
import { sqlite3MockModule } from '../setup';

@typeorm.Entity()
export class User {
  @typeorm.PrimaryColumn()
  id: number;

  @typeorm.Column()
  firstName: string;

  @typeorm.Column()
  lastName: string;

  constructor(id: number, firstName: string, lastName: string) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export const MockSqliteDriver = {
  verbose: () => {
    return sqlite3MockModule;
  },
};

// type is typeorm.ConnectionOptions for <0.3.0
// and typeorm.DataSourceOptions for >=0.3.0
export const defaultOptions: any = {
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  synchronize: true,
  entities: [User],
  driver: MockSqliteDriver,
};

export const rawQueryOptions: any = {
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  synchronize: true,
  entities: [User],
  name: 'rawQuery',
  driver: MockSqliteDriver,
};
