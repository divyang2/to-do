import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Col, Form, Input, Layout, List, message, Modal, Row } from 'antd';
import { getItem, setItem } from '../../utils/utils';
import { EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import '../Todo/Todo.css';
const { confirm } = Modal;
const { TextArea } = Input;
const { Header, Content, Footer } = Layout;

const Todo = () => {
    const todoData = JSON.parse(getItem('todoData'));
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState();
    const [deleteData, setDeleteData] = useState(false);
    const [checkedItems, setCheckedItems] = useState([]);
    const [searchText, setSearchText] = useState('');

    const handleCheck = (id) => {
        setCheckedItems(
            checkedItems.includes(id)
                ? checkedItems.filter((item) => item !== id)
                : [...checkedItems, id],
        );
    };

    const clearDoneTask = () => {
        const remainingData = todoData?.filter((item) => !checkedItems.includes(item.id));
        setItem('todoData', JSON.stringify(remainingData));
        setCheckedItems([]);
    };

    const handleDelete = (item) => {
        const deletedData = todoData?.filter((i) => i.id != item.id);
        setItem('todoData', JSON.stringify(deletedData));
        setDeleteData(!deleteData);
    };

    const onFinish = (values) => {
        if (edit) {
            const editData = todoData?.map((d) => {
                if (edit === d.id) {
                    return { ...values, id: edit };
                }
                return d;
            });
            setItem('todoData', JSON.stringify(editData));
            setEdit();
            setOpen(!open);
            form.resetFields();
        } else {
            const uniqId = Date.now();
            const valuesWithID = { ...values, id: uniqId };
            setItem('todoData', JSON.stringify([...todoData, valuesWithID]));
            setOpen(!open);
            form.resetFields();
        }
    };

    const handleEdit = (item) => {
        setEdit(item.id);
        setOpen(!open);
        form.setFieldsValue(item);
    };

    const showDeleteConfirm = (item) => {
        confirm({
            title: 'Are you sure delete this task?',
            icon: <ExclamationCircleFilled />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                handleDelete(item);
            },
        });
    };

    const showClearConfirm = () => {
        confirm({
            title: 'Are you sure clear done tasks?',
            icon: <ExclamationCircleFilled />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                clearDoneTask();
            },
        });
    };

    const filteredData = todoData?.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(searchText.toLowerCase());
        const descMatch = item.desc?.toLowerCase().includes(searchText.toLowerCase());
        return titleMatch || descMatch;
    });

    useEffect(() => {
        if (!todoData) {
            setItem('todoData', JSON.stringify([]));
        }
    }, [deleteData]);
    return (
        <div>
            {contextHolder}
            <Layout className="layout">
                <Header className="header">
                    <div className="headerContainer">
                        To-Do Task
                        <Button className="taskButton" onClick={() => setOpen(!open)}>
                            Add Task
                        </Button>
                    </div>
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <div className="site-layout-content">
                        <Modal
                            open={open}
                            title={edit ? 'Edit Task' : 'Add Task'}
                            onOk={() => form.submit()}
                            okText={edit ? 'Edit Task' : 'Add Task'}
                            cancelButtonProps={{ style: { color: 'blueviolet' } }}
                            okButtonProps={{ style: { backgroundColor: 'blueviolet' } }}
                            onCancel={() => {
                                setOpen(!open);
                                form.resetFields();
                            }}
                        >
                            <Form form={form} onFinish={onFinish} layout="vertical">
                                <Form.Item
                                    name="title"
                                    label="Task Title"
                                    rules={[{ required: true, message: 'Please Enter Title' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Description" name="desc">
                                    <TextArea rows={4} maxLength={100} showCount={true} />
                                </Form.Item>
                            </Form>
                        </Modal>
                    </div>
                    <Row className="searchBar">
                        <Col>
                            <Button
                                onClick={() => {
                                    if (checkedItems.length > 0) {
                                        showClearConfirm();
                                    } else {
                                        messageApi.open({
                                            type: 'error',
                                            content: 'Please select tasks',
                                        });
                                    }
                                }}
                                danger
                            >
                                Clear Completed Task
                            </Button>
                        </Col>
                        <Col>
                            <Input
                                placeholder="search your task here"
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <List
                        dataSource={filteredData}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="list-loadmore-edit"
                                        disabled={checkedItems.includes(item.id)}
                                        onClick={() => handleEdit(item)}
                                    >
                                        <EditOutlined style={{ color: 'blueviolet' }} />
                                    </Button>,
                                    <Button
                                        key="list-loadmore-more"
                                        disabled={checkedItems.includes(item.id)}
                                        onClick={() => showDeleteConfirm(item)}
                                    >
                                        <DeleteOutlined style={{ color: 'red' }} />
                                    </Button>,
                                ]}
                            >
                                <Checkbox
                                    checked={checkedItems.includes(item.id)}
                                    onChange={() => handleCheck(item.id)}
                                ></Checkbox>
                                <List.Item.Meta
                                    title={
                                        checkedItems.includes(item.id) ? (
                                            <s>{item.title}</s>
                                        ) : (
                                            item.title
                                        )
                                    }
                                    description={
                                        item.desc ? (
                                            checkedItems.includes(item.id) ? (
                                                <s>{item.desc}</s>
                                            ) : (
                                                item.desc
                                            )
                                        ) : (
                                            ''
                                        )
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    To-Do App ©2023 Created by Divyang Patel
                </Footer>
            </Layout>
        </div>
    );
};

export default Todo;
