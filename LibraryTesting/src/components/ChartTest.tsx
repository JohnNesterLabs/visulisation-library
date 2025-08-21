import React, { useEffect, useRef, useState } from 'react';
import { BarChart, LineChart, PieChart, ScatterPlot } from '@johnhoro/visualization-library';

interface ChartData {
  label: string;
  value: number;
}

interface LineData {
  x: number;
  y: number; 
}

const ChartTest: React.FC = () => {
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [showValues, setShowValues] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const barData: ChartData[] = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 200 },
    { label: 'Apr', value: 180 },
    { label: 'May', value: 250 },
    { label: 'Jun', value: 220 }
  ];

  const lineData: LineData[] = [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 15 },
    { x: 4, y: 25 },
    { x: 5, y: 30 },
    { x: 6, y: 22 }
  ];

  const pieData: ChartData[] = [
    { label: 'Red', value: 30 },
    { label: 'Blue', value: 25 },
    { label: 'Green', value: 45 }
  ];

  const scatterData: LineData[] = [
    { x: 1, y: 5 },
    { x: 2, y: 8 },
    { x: 3, y: 12 },
    { x: 4, y: 15 },
    { x: 5, y: 18 },
    { x: 6, y: 22 }
  ];

  const handleBarClick = (point: ChartData) => {
    console.log('Bar clicked:', point);
    alert(`Clicked: ${point.label} - $${point.value}`);
  };

  const handleLineClick = (point: LineData) => {
    console.log('Line point clicked:', point);
    alert(`Clicked: x=${point.x}, y=${point.y}`);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Chart Library Testing</h1>
      
      {/* Controls */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3>Controls</h3>
        <button 
          onClick={() => setOrientation(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
          style={{ margin: '5px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Toggle Orientation
        </button>
        <button 
          onClick={() => setShowValues(!showValues)}
          style={{ margin: '5px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Toggle Values
        </button>
        <button 
          onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          style={{ margin: '5px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Toggle Theme
        </button>
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* Bar Chart */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>Bar Chart</h3>
          <BarChartTest 
            data={barData}
            orientation={orientation}
            showValues={showValues}
            theme={theme}
            onPointClick={handleBarClick}
          />
        </div>

        {/* Line Chart */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>Line Chart</h3>
          <LineChartTest 
            data={lineData}
            theme={theme}
            onPointClick={handleLineClick}
          />
        </div>

        {/* Pie Chart */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>Pie Chart</h3>
          <PieChartTest 
            data={pieData}
            theme={theme}
            onPointClick={handleBarClick}
          />
        </div>

        {/* Scatter Plot */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>Scatter Plot</h3>
          <ScatterPlotTest 
            data={scatterData}
            theme={theme}
            onPointClick={handleLineClick}
          />
        </div>
      </div>
    </div>
  );
};

// Individual Chart Components
const BarChartTest: React.FC<{
  data: ChartData[];
  orientation: 'vertical' | 'horizontal';
  showValues: boolean;
  theme: 'light' | 'dark';
  onPointClick: (point: ChartData) => void;
}> = ({ data, orientation, showValues, theme, onPointClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      chartRef.current = new BarChart(containerRef.current, {
        data,
        width: 500,
        height: 300,
        title: 'Monthly Revenue',
        orientation,
        showValues,
        theme,
        onPointClick
      });
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.updateOptions({ orientation, showValues, theme });
    }
  }, [orientation, showValues, theme]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.updateData(data);
    }
  }, [data]);

  return <div ref={containerRef} />;
};

const LineChartTest: React.FC<{
  data: LineData[];
  theme: 'light' | 'dark';
  onPointClick: (point: LineData) => void;
}> = ({ data, theme, onPointClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      chartRef.current = new LineChart(containerRef.current, {
        data,
        width: 500,
        height: 300,
        title: 'Sales Trend',
        theme,
        onPointClick
      });
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.updateOptions({ theme });
    }
  }, [theme]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.updateData(data);
    }
  }, [data]);

  return <div ref={containerRef} />;
};

const PieChartTest: React.FC<{
  data: ChartData[];
  theme: 'light' | 'dark';
  onPointClick: (point: ChartData) => void;
}> = ({ data, theme, onPointClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      chartRef.current = new PieChart(containerRef.current, {
        data,
        width: 400,
        height: 300,
        title: 'Color Distribution',
        theme,
        onPointClick
      });
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.updateOptions({ theme });
    }
  }, [theme]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.updateData(data);
    }
  }, [data]);

  return <div ref={containerRef} />;
};
 
const ScatterPlotTest: React.FC<{
  data: LineData[];
  theme: 'light' | 'dark';
  onPointClick: (point: LineData) => void;
}> = ({ data, theme, onPointClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      chartRef.current = new ScatterPlot(containerRef.current, {
        data,
        width: 500,
        height: 300,
        title: 'Data Correlation',
        theme,
        onPointClick
      });
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.updateOptions({ theme });
    }
  }, [theme]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.updateData(data);
    }
  }, [data]);

  return <div ref={containerRef} />;
};



export default ChartTest;
