/*
 * Copyright 2023 Palantir Technologies, Inc. All rights reserved.
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

import * as React from "react";

import { EntityTitle, H1 } from "@blueprintjs/core";

import { ExampleCard } from "./ExampleCard";

export class EntityTitleExample extends React.PureComponent {
    public render() {
        return (
            <ExampleCard label="Entity title">
                <H1>
                    <EntityTitle title="Placeholder title" />
                </H1>
                <EntityTitle title="Placeholder text" />
                <H1>
                    <EntityTitle title="Sample title" />
                </H1>
                <EntityTitle title="Sample text" />
                <H1>
                    <EntityTitle title="Disabled title" />
                </H1>
                <EntityTitle title="Disabled text" />
            </ExampleCard>
        );
    }
}
