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

export function muchWork(stringAttribute: string): string {
  return 'Work completed successfully!';
}

export function muchWorkWithPromise(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Done after timeout');
    }, 2000);
  });
}

export function funWithNestedArgs(args: {
  user: {
    id: number;
    name: string;
    preferences: {
      theme: string;
      notifications: {
        email: boolean;
        sms: boolean;
        push: { enabled: boolean; time: string };
      };
    };
  };
  items: Array<{
    id: string;
    details: {
      category: string;
      tags: string[];
      metadata: { created: Date; updated: Date };
    };
  }>;
}): string {
  const userTheme = args.user.preferences.theme;
  const pushEnabled = args.user.preferences.notifications.push.enabled;
  const firstItemCategory = args.items[0]?.details.category ?? 'none';
  return `User ${args.user.name} prefers ${userTheme} theme, push notifications: ${pushEnabled}, first item category: ${firstItemCategory}`;
}

export function funWithNestedArrays(args: any): string {
  return `Processed ${args.orders?.length} orders`;
}
