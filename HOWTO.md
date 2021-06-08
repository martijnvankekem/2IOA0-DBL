# How to visualize
Currently, two visualization type can be generated, the Adjecency matrix and Hierarchical Edge Diagram. Although the support for the Graph is built in the application, this is not functional yet.

To create an visualizations, visit the 'Visualizations' tab in the menu-bar, and click 'Adjacency Matrix' or 'Hierarchical Edge Diagram' in the visualization type window.
You can now upload a dataset to visualize. We recommend using the Enron e-mail dataset in the 'Relevant files' folder, as this is guaranteed to be a working example.

The user now can re-order the columns in the CSV file to give them a specific meaning.
All columns are ordered by default for the Enron e-mail dataset. When the user uses this dataset, they will only have to click 'Visualize data' to generate a visualization.

However, the user also has the freedom to consider another attribute as the main attribute. Please read the information under [Creating a custom visualization](#creating-a-custom-visualization) below for more information.

After the visualization has been generated, the user can interact with it. By hovering over the matrix, the current row and column will highlight, and an information box will appear. By hovering over the Hierarchical Edge Diagram, the email traffic will be shown, red being outgoing email, blue being incoming email. The information box will tell you all about the atributes you want to show. 
The 'Average' number in the information box is the average of the main link attribute, which by default is the sentiment. Also, the total amount of links between two nodes is shown. 

To make the visualization larger or smaller, the user can use the buttons 'Zoom in' and 'Zoom out' at the top of the page. There is also an option to change the timeframe, this can be done by changing the times in the calander on top of the page. The help button on top of the page is there to support users when they dont know what the visualization actually contains. 

### Creating a custom visualization
As explained above, the application is built to work with the Enron e-mail dataset by default. This dataset is included in the 'Relevant files' folder, under the name ```enron-v1.csv```.
A user can however modify the attributes to create a custom visualization.

For example, a user wants to create a visualization between the different job titles in the data set, instead of the e-mail addresses.
This can be achieved by dragging the 'jobtitle' attribute for both the source node group, and the target node group, to the top.

**Important**: attributes you want to merge, must have the same value in the 'attribute' column. For example, 'fromJobtitle' and 'toJobtitle' must have a common attribute value, eg. 'jobtitle'.

A user can also add other relevant attributes, which are otherwise unused. This will not change the appearance of the visualization, but it will add the attribute to the information box for further inspection later on.
