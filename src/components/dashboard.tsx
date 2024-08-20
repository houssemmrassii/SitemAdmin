import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';    
import { Card, Row, Col, Table } from 'antd';
import { db } from '../firebaseConfig'; // Import the Firestore database
import { collection, getDocs } from 'firebase/firestore';
import './Dashboard.scss';
import { LineChart as MUILineChart } from '@mui/x-charts/LineChart';

interface Command {
  deliveryAddress: string;
  deliveryCost: number;
  deliveryManId: string;
  discount: number;
  finalTotal: number;
  id: string;
  items: any[];
  paymentMethod: string;
  status: string;
  tip: number;
}

const Dashboard: React.FC = () => {
  const [commandData, setCommandData] = useState<Command[]>([]);
  const [topMetrics, setTopMetrics] = useState({
    totalCommands: 0,
    totalRevenue: 0,
    totalDiscounts: 0,
    averageTip: 0,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    // Fetch command data from Firestore
    const fetchCommands = async () => {
      const commandCollection = collection(db, 'command');
      const commandSnapshot = await getDocs(commandCollection);
      const commandList = commandSnapshot.docs.map(doc => doc.data() as Command);

      setCommandData(commandList);

      const totalRevenue = commandList.reduce((sum: number, command: Command) => sum + (command.finalTotal || 0), 0);
      const totalDiscounts = commandList.reduce((sum: number, command: Command) => sum + (command.discount || 0), 0);
      const totalCommands = commandList.length;
      const averageTip = totalCommands > 0 
        ? commandList.reduce((sum: number, command: Command) => sum + (command.tip || 0), 0) / totalCommands 
        : 0;

      setTopMetrics(prev => ({
        ...prev,
        totalCommands,
        totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
        totalDiscounts: isNaN(totalDiscounts) ? 0 : totalDiscounts,
        averageTip: isNaN(averageTip) ? 0 : averageTip,
      }));
    };

    fetchCommands();
  }, []);

  // Static data for the pie chart representing 405 total commands
  const pieChartData = [
    { name: 'Livrée', value: 200, color: '#4CAF50' },   // Example: 200 commands are 'Livrée'
    { name: 'En cours', value: 150, color: '#FF9800' }, // Example: 150 commands are 'En cours'
    { name: 'Annulé', value: 55, color: '#F44336' },    // Example: 55 commands are 'Annulé'
  ];

  const onPieEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="dashboard-container">
      <h3>Tableau de bord Admin</h3>
      <Row gutter={[16, 16]}>
        {/* Métriques principales */}
        <Col span={6}>
          <Card title="Total des Commandes" bordered={false}>
            <p>{topMetrics.totalCommands}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Revenu Total" bordered={false}>
            <p>{topMetrics.totalRevenue ? topMetrics.totalRevenue.toFixed(2) : '0.00'} €</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Total des Réductions" bordered={false}>
            <p>{topMetrics.totalDiscounts ? topMetrics.totalDiscounts.toFixed(2) : '0.00'} €</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Pourboire Moyen" bordered={false}>
            <p>{topMetrics.averageTip > 0 ? topMetrics.averageTip.toFixed(2) : '-'}</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={12}>
          {/* Static Line Chart */}
          <Card title="Commandes au fil du temps" bordered={false} className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <MUILineChart
                xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] }]}  // Static months
                series={[
                  {
                    label: 'Commandes',
                    data: [100, 200, 150, 300, 250, 400], // Static data points for commands
                  },
                  {
                    label: 'Revenu',
                    data: [1000, 2500, 2000, 3200, 2700, 4500], // Static data points for revenue
                  },
                ]}
                width={500}
                height={300}
              />
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          {/* Statut des Commandes */}
          <Card title="Livraison" bordered={false} className="pie-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={index === activeIndex ? '#000000' : '#FFFFFF'}
                      strokeWidth={index === activeIndex ? 2 : 1}
                    />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pie-center-text"
                >
                  {activeIndex !== null
                    ? `${Math.round((pieChartData[activeIndex].value / topMetrics.totalCommands) * 100)}%`
                    : `${Math.round((pieChartData[0].value / topMetrics.totalCommands) * 100)}%`}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pie-subtext"
                >
                  {activeIndex !== null
                    ? `${pieChartData[activeIndex].name} (${pieChartData[activeIndex].value} commandes)`
                    : 'Commandes livrées'}
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-container">
              <span className="livree">● Livrée</span> &nbsp;&nbsp;
              <span className="en-cours">● En cours</span> &nbsp;&nbsp;
              <span className="annule">● Annulé</span> &nbsp;&nbsp;
              <span className="non-traitee">● Non traitée</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={12}>
          {/* Commandes Récentes */}
          <Card title="Commandes Récentes" bordered={false} className="recent-orders-container">
            <Table
              dataSource={commandData.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()).slice(0, 5)}
              pagination={false}
              locale={{ emptyText: 'Aucune commande récente' }} // Display this when there's no data
              columns={[
                { title: 'ID Commande', dataIndex: 'id', key: 'id' },
                { title: 'Client', dataIndex: 'deliveryAddress', key: 'deliveryAddress' },
                { title: 'Statut', dataIndex: 'status', key: 'status' },
                { title: 'Prix Total', dataIndex: 'finalTotal', key: 'finalTotal' },
                { title: 'Date de Création', dataIndex: 'id', key: 'id', render: text => new Date(text).toLocaleDateString() },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
